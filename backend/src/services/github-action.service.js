import { logger } from "../config/logger.js";
import { getUserAccessToken } from "../lib/token.js";
import { botActionRepository } from "../repositories/index.js";
import { githubService } from "./github.service.js";

const ISSUE_EVENT_TYPES = new Set(["issues", "pull_request"]);

async function executeGitHubAction({
  actionType,
  actionValue,
  accessToken,
  owner,
  name,
  issueNumber,
  botActionId,
}) {
  const requestPayload = {
    owner,
    name,
    issueNumber,
    ...(actionValue && { value: actionValue }),
  };

  try {
    let responsePayload;

    if (actionType === "ADD_LABEL") {
      responsePayload = await githubService.addLabel(
        accessToken,
        owner,
        name,
        issueNumber,
        actionValue,
      );
    } else if (actionType === "ADD_COMMENT") {
      responsePayload = await githubService.addComment(
        accessToken,
        owner,
        name,
        issueNumber,
        actionValue,
      );
    } else {
      throw new Error(`Unsupported GitHub action type: ${actionType}`);
    }

    await botActionRepository.updateStatus(botActionId, "SUCCESS", {
      requestPayload,
      responsePayload,
      completedAt: new Date(),
    });

    logger.info({ botActionId, actionType }, "GitHub action succeeded");

    return { success: true, responsePayload };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "GitHub action failed";

    await botActionRepository.updateStatus(botActionId, "FAILED", {
      requestPayload,
      errorMessage,
      completedAt: new Date(),
    });

    logger.error({ err: error, botActionId, actionType }, "GitHub action failed");

    return { success: false, errorMessage };
  }
}

export const githubActionService = {
  async executeAction({
    action,
    userId,
    repository,
    eventContext,
    eventId,
    ruleMatchId,
  }) {
    const actionType = action.type;
    const actionValue = action.value;

    const botAction = await botActionRepository.create({
      eventId,
      ruleMatchId,
      repositoryId: repository.id,
      actionType,
      status: "PENDING",
      requestPayload: action,
    });

    logger.info(
      { botActionId: botAction.id, actionType, eventId, ruleMatchId },
      "Action started",
    );

    if (!ISSUE_EVENT_TYPES.has(eventContext.eventType)) {
      const errorMessage = `Action ${actionType} is not supported for ${eventContext.eventType} events`;

      await botActionRepository.updateStatus(botAction.id, "FAILED", {
        errorMessage,
        completedAt: new Date(),
      });

      logger.warn(
        { botActionId: botAction.id, actionType, eventType: eventContext.eventType },
        "GitHub action skipped for unsupported event type",
      );

      return { success: false, errorMessage };
    }

    if (!eventContext.issueNumber) {
      const errorMessage = "No issue or pull request number found in event payload";

      await botActionRepository.updateStatus(botAction.id, "FAILED", {
        errorMessage,
        completedAt: new Date(),
      });

      logger.warn({ botActionId: botAction.id, actionType }, errorMessage);

      return { success: false, errorMessage };
    }

    if (actionType === "ADD_LABEL" && !actionValue) {
      const errorMessage = "ADD_LABEL action requires a label value";

      await botActionRepository.updateStatus(botAction.id, "FAILED", {
        errorMessage,
        completedAt: new Date(),
      });

      return { success: false, errorMessage };
    }

    if (actionType === "ADD_COMMENT" && !actionValue) {
      const errorMessage = "ADD_COMMENT action requires a comment value";

      await botActionRepository.updateStatus(botAction.id, "FAILED", {
        errorMessage,
        completedAt: new Date(),
      });

      return { success: false, errorMessage };
    }

    const accessToken = await getUserAccessToken(userId);

    return executeGitHubAction({
      actionType,
      actionValue,
      accessToken,
      owner: repository.owner,
      name: repository.name,
      issueNumber: eventContext.issueNumber,
      botActionId: botAction.id,
    });
  },
};
