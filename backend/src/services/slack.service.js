import { logger } from "../config/logger.js";
import { botActionRepository } from "../repositories/index.js";

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function buildSlackMessage({ repositoryName, eventType, title, author, link }) {
  const lines = [
    `*Repository:* ${repositoryName}`,
    `*Event:* ${eventType}`,
  ];

  if (title) {
    lines.push(`*Title:* ${title}`);
  }

  if (author) {
    lines.push(`*Author:* ${author}`);
  }

  if (link) {
    lines.push(`*Link:* ${link}`);
  }

  return lines.join("\n");
}

export const slackService = {
  async sendNotification({
    webhookUrl,
    repositoryName,
    eventType,
    title,
    author,
    link,
    botActionId,
  }) {
    const requestPayload = {
      repositoryName,
      eventType,
      title,
      author,
      link,
    };

    if (!webhookUrl) {
      const errorMessage = "Slack webhook URL is not configured";

      await botActionRepository.updateStatus(botActionId, "FAILED", {
        requestPayload,
        errorMessage,
        completedAt: new Date(),
      });

      logger.warn({ botActionId }, "Slack notification skipped: no webhook URL");

      return { success: false, errorMessage };
    }

    const text = buildSlackMessage(requestPayload);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const responsePayload = await parseResponseBody(response);

      if (!response.ok) {
        const errorMessage =
          responsePayload?.error || responsePayload?.message || "Slack request failed";

        await botActionRepository.updateStatus(botActionId, "FAILED", {
          requestPayload: { ...requestPayload, text },
          responsePayload,
          errorMessage,
          completedAt: new Date(),
        });

        logger.error(
          { botActionId, status: response.status, errorMessage },
          "Slack notification failed",
        );

        return { success: false, errorMessage };
      }

      await botActionRepository.updateStatus(botActionId, "SUCCESS", {
        requestPayload: { ...requestPayload, text },
        responsePayload,
        completedAt: new Date(),
      });

      logger.info({ botActionId }, "Slack notification succeeded");

      return { success: true, responsePayload };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Slack request failed";

      await botActionRepository.updateStatus(botActionId, "FAILED", {
        requestPayload: { ...requestPayload, text },
        errorMessage,
        completedAt: new Date(),
      });

      logger.error({ err: error, botActionId }, "Slack notification failed");

      return { success: false, errorMessage };
    }
  },
};
