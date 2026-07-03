import { z } from "zod";
import { NotFoundError } from "../lib/errors.js";
import {
  getPaginationParams,
  paginatedResponse,
} from "../lib/pagination.js";
import { paginationSchema, validate } from "../lib/validation.js";
import {
  dashboardRepository,
  repositoryRepository,
} from "../repositories/index.js";

const eventStatusSchema = z.enum([
  "RECEIVED",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
  "SKIPPED",
]);

const actionStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);

const actionTypeSchema = z.enum(["ADD_LABEL", "ADD_COMMENT", "SLACK_NOTIFY"]);

const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const scopedFilterSchema = dateRangeSchema.extend({
  repositoryId: z.string().cuid().optional(),
});

const eventsQuerySchema = paginationSchema.merge(scopedFilterSchema).extend({
  eventType: z.string().trim().min(1).optional(),
  status: eventStatusSchema.optional(),
});

const actionsQuerySchema = paginationSchema.merge(scopedFilterSchema).extend({
  status: actionStatusSchema.optional(),
  actionType: actionTypeSchema.optional(),
});

const repositoriesQuerySchema = paginationSchema.merge(
  z.object({
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  }),
);

const overviewQuerySchema = z.object({
  repositoryId: z.string().cuid().optional(),
});

const statsQuerySchema = scopedFilterSchema;

function groupByToRecord(groups, keyField) {
  return groups.reduce((accumulator, group) => {
    accumulator[group[keyField]] = group._count._all;
    return accumulator;
  }, {});
}

function toPublicEvent(event) {
  return {
    id: event.id,
    repositoryId: event.repositoryId,
    repositoryFullName: event.repository.fullName,
    deliveryId: event.deliveryId,
    eventType: event.eventType,
    action: event.action,
    githubSender: event.githubSender,
    status: event.status,
    errorMessage: event.errorMessage,
    aiSummary: event.aiSummary,
    aiPriority: event.aiPriority,
    aiSuggestedLabel: event.aiSuggestedLabel,
    receivedAt: event.receivedAt,
    processedAt: event.processedAt,
    matchCount: event._count.matches,
    actionCount: event._count.botActions,
  };
}

function toPublicAction(action) {
  return {
    id: action.id,
    eventId: action.eventId,
    ruleMatchId: action.ruleMatchId,
    repositoryId: action.repositoryId,
    repositoryFullName: action.repository.fullName,
    actionType: action.actionType,
    status: action.status,
    errorMessage: action.errorMessage,
    createdAt: action.createdAt,
    completedAt: action.completedAt,
    rule: action.ruleMatch?.rule
      ? {
          id: action.ruleMatch.rule.id,
          name: action.ruleMatch.rule.name,
        }
      : null,
  };
}

function toPublicRepository(repository) {
  return {
    id: repository.id,
    githubRepoId: repository.githubRepoId,
    owner: repository.owner,
    name: repository.name,
    fullName: repository.fullName,
    isPrivate: repository.isPrivate,
    isActive: repository.isActive,
    connectedAt: repository.connectedAt,
    disconnectedAt: repository.disconnectedAt,
    eventCount: repository._count.events,
    actionCount: repository._count.botActions,
    ruleCount: repository._count.rules,
  };
}

async function verifyRepositoryFilter(userId, repositoryId) {
  if (!repositoryId) {
    return;
  }

  const repository = await repositoryRepository.findByIdForUser(
    repositoryId,
    userId,
  );

  if (!repository) {
    throw new NotFoundError("Repository not found");
  }
}

export const dashboardService = {
  async getOverview(userId, query) {
    const { repositoryId } = validate(overviewQuerySchema, query);
    await verifyRepositoryFilter(userId, repositoryId);

    const overview = await dashboardRepository.getOverview(userId, {
      repositoryId,
    });

    const repositories = overview.repositoryCounts.reduce(
      (accumulator, group) => {
        accumulator.total += group._count._all;

        if (group.isActive) {
          accumulator.active = group._count._all;
        } else {
          accumulator.inactive = group._count._all;
        }

        return accumulator;
      },
      { total: 0, active: 0, inactive: 0 },
    );

    const rules = overview.ruleCounts.reduce(
      (accumulator, group) => {
        accumulator.total += group._count._all;

        if (group.isEnabled) {
          accumulator.enabled = group._count._all;
        } else {
          accumulator.disabled = group._count._all;
        }

        return accumulator;
      },
      { total: 0, enabled: 0, disabled: 0 },
    );

    return {
      repositories,
      rules,
      events: {
        byStatus: groupByToRecord(overview.eventStatusCounts, "status"),
        total: overview.eventStatusCounts.reduce(
          (sum, group) => sum + group._count._all,
          0,
        ),
        recent: overview.recentEvents.map(toPublicEvent),
      },
      actions: {
        byStatus: groupByToRecord(overview.actionStatusCounts, "status"),
        total: overview.actionStatusCounts.reduce(
          (sum, group) => sum + group._count._all,
          0,
        ),
        recent: overview.recentActions.map(toPublicAction),
      },
    };
  },

  async listEvents(userId, query) {
    const filters = validate(eventsQuerySchema, query);
    await verifyRepositoryFilter(userId, filters.repositoryId);

    const { page, limit, ...eventFilters } = filters;
    const pagination = getPaginationParams({ page, limit });

    const [events, total] = await Promise.all([
      dashboardRepository.findEvents(userId, eventFilters, pagination),
      dashboardRepository.countEvents(userId, eventFilters),
    ]);

    return paginatedResponse(events.map(toPublicEvent), { page, limit, total });
  },

  async listActions(userId, query) {
    const filters = validate(actionsQuerySchema, query);
    await verifyRepositoryFilter(userId, filters.repositoryId);

    const { page, limit, ...actionFilters } = filters;
    const pagination = getPaginationParams({ page, limit });

    const [actions, total] = await Promise.all([
      dashboardRepository.findActions(userId, actionFilters, pagination),
      dashboardRepository.countActions(userId, actionFilters),
    ]);

    return paginatedResponse(actions.map(toPublicAction), {
      page,
      limit,
      total,
    });
  },

  async listRepositories(userId, query) {
    const filters = validate(repositoriesQuerySchema, query);
    const { page, limit, isActive } = filters;
    const pagination = getPaginationParams({ page, limit });
    const repositoryFilters = { isActive };

    const [repositories, total] = await Promise.all([
      dashboardRepository.findRepositories(userId, repositoryFilters, pagination),
      dashboardRepository.countRepositories(userId, repositoryFilters),
    ]);

    return paginatedResponse(repositories.map(toPublicRepository), {
      page,
      limit,
      total,
    });
  },

  async getStats(userId, query) {
    const filters = validate(statsQuerySchema, query);
    await verifyRepositoryFilter(userId, filters.repositoryId);

    const stats = await dashboardRepository.getStats(userId, filters);

    return {
      totals: {
        events: stats.totalEvents,
        actions: stats.totalActions,
        ruleMatches: stats.totalRuleMatches,
      },
      events: {
        byStatus: groupByToRecord(stats.eventsByStatus, "status"),
        byType: groupByToRecord(stats.eventsByType, "eventType"),
      },
      actions: {
        byStatus: groupByToRecord(stats.actionsByStatus, "status"),
        byType: groupByToRecord(stats.actionsByType, "actionType"),
      },
    };
  },
};
