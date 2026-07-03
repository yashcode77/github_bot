import { z } from "zod";
import { logger } from "../config/logger.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";
import { validate } from "../lib/validation.js";
import {
  botActionRepository,
  repositoryRepository,
  ruleMatchRepository,
  ruleRepository,
  userRepository,
} from "../repositories/index.js";
import { githubActionService } from "./github-action.service.js";
import { slackService } from "./slack.service.js";

const conditionSchema = z.object({
  field: z.enum(["title", "body", "sender", "action"]),
  operator: z.enum(["contains", "equals", "startsWith"]),
  value: z.string(),
});

const addLabelActionSchema = z.object({
  type: z.literal("ADD_LABEL"),
  value: z.string().trim().min(1),
});

const addCommentActionSchema = z.object({
  type: z.literal("ADD_COMMENT"),
  value: z.string().trim().min(1),
});

const slackNotifyActionSchema = z.object({
  type: z.literal("SLACK_NOTIFY"),
});

const actionSchema = z.discriminatedUnion("type", [
  addLabelActionSchema,
  addCommentActionSchema,
  slackNotifyActionSchema,
]);

const createRuleSchema = z.object({
  name: z.string().trim().min(1),
  repositoryId: z.string().cuid(),
  eventType: z.enum(["issues", "pull_request", "push"]),
  eventAction: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  isEnabled: z.boolean().optional(),
  conditions: z.array(conditionSchema).default([]),
  actions: z.array(actionSchema).min(1),
});

const updateRuleSchema = createRuleSchema
  .omit({ repositoryId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

function toPublicRule(rule) {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    repositoryId: rule.repositoryId,
    eventType: rule.eventType,
    eventAction: rule.eventAction,
    conditions: rule.conditions,
    actions: rule.actions,
    isEnabled: rule.isEnabled,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

async function getOwnedRule(userId, ruleId) {
  const rule = await ruleRepository.findById(ruleId);

  if (!rule) {
    throw new NotFoundError("Rule not found");
  }

  if (rule.userId !== userId) {
    throw new ForbiddenError("You do not have access to this rule");
  }

  return rule;
}

async function verifyRepositoryAccess(userId, repositoryId) {
  const repository = await repositoryRepository.findByIdForUser(
    repositoryId,
    userId,
  );

  if (!repository) {
    throw new NotFoundError("Repository not found");
  }

  if (!repository.isActive) {
    throw new ForbiddenError("Repository is not connected");
  }

  return repository;
}

function extractEventContext(event) {
  const payload = event.payload;

  if (event.eventType === "issues") {
    return {
      eventType: event.eventType,
      title: payload.issue?.title ?? "",
      body: payload.issue?.body ?? "",
      sender: event.githubSender ?? payload.sender?.login ?? "",
      action: event.action ?? payload.action ?? "",
      issueNumber: payload.issue?.number ?? null,
      htmlUrl: payload.issue?.html_url ?? null,
      author: payload.issue?.user?.login ?? payload.sender?.login ?? null,
    };
  }

  if (event.eventType === "pull_request") {
    return {
      eventType: event.eventType,
      title: payload.pull_request?.title ?? "",
      body: payload.pull_request?.body ?? "",
      sender: event.githubSender ?? payload.sender?.login ?? "",
      action: event.action ?? payload.action ?? "",
      issueNumber: payload.pull_request?.number ?? null,
      htmlUrl: payload.pull_request?.html_url ?? null,
      author: payload.pull_request?.user?.login ?? payload.sender?.login ?? null,
    };
  }

  return {
    eventType: event.eventType,
    title: payload.head_commit?.message ?? "",
    body: "",
    sender: event.githubSender ?? payload.sender?.login ?? payload.pusher?.name ?? "",
    action: event.action ?? payload.action ?? "",
    issueNumber: null,
    htmlUrl: payload.compare ?? null,
    author: payload.pusher?.name ?? payload.sender?.login ?? null,
  };
}

function getFieldValue(field, eventContext) {
  switch (field) {
    case "title":
      return eventContext.title ?? "";
    case "body":
      return eventContext.body ?? "";
    case "sender":
      return eventContext.sender ?? "";
    case "action":
      return eventContext.action ?? "";
    default:
      return "";
  }
}

function evaluateCondition(condition, eventContext) {
  const fieldValue = getFieldValue(condition.field, eventContext);
  const expected = condition.value ?? "";

  switch (condition.operator) {
    case "contains":
      return fieldValue.toLowerCase().includes(expected.toLowerCase());
    case "equals":
      return fieldValue.toLowerCase() === expected.toLowerCase();
    case "startsWith":
      return fieldValue.toLowerCase().startsWith(expected.toLowerCase());
    default:
      return false;
  }
}

function ruleMatchesEvent(rule, event, eventContext) {
  if (rule.eventAction && rule.eventAction !== event.action) {
    return false;
  }

  const conditions = Array.isArray(rule.conditions) ? rule.conditions : [];

  return conditions.every((condition) => evaluateCondition(condition, eventContext));
}

async function executeRuleActions({
  rule,
  event,
  repository,
  user,
  ruleMatch,
  eventContext,
}) {
  const actions = Array.isArray(rule.actions) ? rule.actions : [];

  for (const action of actions) {
    try {
      if (action.type === "SLACK_NOTIFY") {
        const botAction = await botActionRepository.create({
          eventId: event.id,
          ruleMatchId: ruleMatch.id,
          repositoryId: repository.id,
          actionType: "SLACK_NOTIFY",
          status: "PENDING",
          requestPayload: action,
        });

        logger.info(
          { botActionId: botAction.id, eventId: event.id, ruleMatchId: ruleMatch.id },
          "Action started",
        );

        await slackService.sendNotification({
          webhookUrl: user.slackWebhookUrl,
          repositoryName: repository.fullName,
          eventType: event.eventType,
          title: eventContext.title,
          author: eventContext.author,
          link: eventContext.htmlUrl,
          botActionId: botAction.id,
        });
      } else {
        await githubActionService.executeAction({
          action,
          userId: repository.userId,
          repository,
          eventContext,
          eventId: event.id,
          ruleMatchId: ruleMatch.id,
        });
      }
    } catch (error) {
      logger.error(
        {
          err: error,
          eventId: event.id,
          ruleId: rule.id,
          actionType: action.type,
        },
        "Action execution threw an unexpected error",
      );
    }
  }
}

export const ruleService = {
  async listRules(userId, { repositoryId } = {}) {
    if (repositoryId) {
      await verifyRepositoryAccess(userId, repositoryId);
      const rules = await ruleRepository.findManyByRepositoryId(repositoryId);
      return rules.map(toPublicRule);
    }

    const rules = await ruleRepository.findManyByUserId(userId);
    return rules.map(toPublicRule);
  },

  async createRule(userId, payload) {
    const input = validate(createRuleSchema, payload);
    await verifyRepositoryAccess(userId, input.repositoryId);

    const rule = await ruleRepository.create({
      userId,
      repositoryId: input.repositoryId,
      name: input.name,
      description: input.description ?? null,
      eventType: input.eventType,
      eventAction: input.eventAction ?? null,
      conditions: input.conditions,
      actions: input.actions,
      isEnabled: input.isEnabled ?? true,
    });

    return toPublicRule(rule);
  },

  async updateRule(userId, ruleId, payload) {
    const existingRule = await getOwnedRule(userId, ruleId);
    const input = validate(updateRuleSchema, payload);

    const rule = await ruleRepository.update(existingRule.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.eventType !== undefined && { eventType: input.eventType }),
      ...(input.eventAction !== undefined && { eventAction: input.eventAction }),
      ...(input.conditions !== undefined && { conditions: input.conditions }),
      ...(input.actions !== undefined && { actions: input.actions }),
      ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
    });

    return toPublicRule(rule);
  },

  async deleteRule(userId, ruleId) {
    const rule = await getOwnedRule(userId, ruleId);
    await ruleRepository.softDelete(rule.id);
  },

  async evaluateAndExecute(event) {
    const repository = await repositoryRepository.findById(event.repositoryId);

    if (!repository) {
      logger.warn(
        { eventId: event.id, repositoryId: event.repositoryId },
        "Repository not found for event processing",
      );
      return;
    }

    const user = await userRepository.findById(repository.userId);

    if (!user) {
      logger.warn(
        { eventId: event.id, userId: repository.userId },
        "User not found for event processing",
      );
      return;
    }

    const rules = await ruleRepository.findManyForEvaluation(
      event.repositoryId,
      event.eventType,
    );

    if (!rules.length) {
      logger.info(
        { eventId: event.id, eventType: event.eventType },
        "No active rules found for event",
      );
      return;
    }

    const eventContext = extractEventContext(event);

    for (const rule of rules) {
      if (!ruleMatchesEvent(rule, event, eventContext)) {
        continue;
      }

      const { match: ruleMatch, created } = await ruleMatchRepository.createIfNotExists({
        eventId: event.id,
        ruleId: rule.id,
      });

      if (!created) {
        logger.info(
          { eventId: event.id, ruleId: rule.id, ruleMatchId: ruleMatch.id },
          "Rule match already recorded, skipping duplicate actions",
        );
        continue;
      }

      logger.info(
        {
          eventId: event.id,
          ruleId: rule.id,
          ruleMatchId: ruleMatch.id,
          matchedAt: ruleMatch.matchedAt,
        },
        "Rule matched",
      );

      await executeRuleActions({
        rule,
        event,
        repository,
        user,
        ruleMatch,
        eventContext,
      });
    }
  },
};
