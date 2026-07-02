import { logger } from "../config/logger.js";
import { ValidationError } from "../lib/errors.js";
import {
  githubEventRepository,
  repositoryRepository,
} from "../repositories/index.js";
import { eventService } from "./event.service.js";

const PERSISTED_EVENT_TYPES = new Set(["issues", "pull_request", "push"]);

function parsePayload(rawBody) {
  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new ValidationError("Invalid webhook JSON payload");
  }
}

function extractSender(payload) {
  if (payload.sender?.login) {
    return payload.sender.login;
  }

  if (payload.pusher?.name) {
    return payload.pusher.name;
  }

  return null;
}

function extractGithubRepoId(payload) {
  return payload.repository?.id ?? null;
}

function scheduleProcessing(eventId) {
  setImmediate(() => {
    eventService.processEvent(eventId).catch((error) => {
      logger.error(
        { err: error, eventId },
        "Unhandled error during async GitHub event processing",
      );
    });
  });
}

export const webhookService = {
  async handleGitHubWebhook({ deliveryId, eventType, rawBody }) {
    if (!deliveryId) {
      throw new ValidationError("Missing X-GitHub-Delivery header");
    }

    if (!eventType) {
      throw new ValidationError("Missing X-GitHub-Event header");
    }

    logger.info(
      { deliveryId, eventType },
      "GitHub webhook received",
    );

    if (eventType === "ping") {
      return { stored: false, duplicate: false, ping: true };
    }

    const existingEvent = await githubEventRepository.findByDeliveryId(deliveryId);

    if (existingEvent) {
      logger.info({ deliveryId }, "Duplicate GitHub delivery ignored");
      return { stored: false, duplicate: true };
    }

    if (!PERSISTED_EVENT_TYPES.has(eventType)) {
      logger.info({ deliveryId, eventType }, "Ignoring unsupported GitHub event type");
      return { stored: false, duplicate: false, unsupported: true };
    }

    const payload = parsePayload(rawBody);
    const githubRepoId = extractGithubRepoId(payload);

    if (!githubRepoId) {
      logger.warn({ deliveryId, eventType }, "GitHub webhook missing repository id");
      return { stored: false, duplicate: false, repositoryNotFound: true };
    }

    const repository =
      await repositoryRepository.findActiveByGithubRepoId(githubRepoId);

    if (!repository) {
      logger.warn(
        { deliveryId, eventType, githubRepoId },
        "GitHub webhook received for unknown or inactive repository",
      );
      return { stored: false, duplicate: false, repositoryNotFound: true };
    }

    let event;

    try {
      event = await githubEventRepository.create({
        repositoryId: repository.id,
        deliveryId,
        eventType,
        action: payload.action ?? null,
        githubSender: extractSender(payload),
        payload,
        status: "RECEIVED",
      });
    } catch (error) {
      if (error.code === "P2002") {
        logger.info({ deliveryId }, "Duplicate GitHub delivery ignored");
        return { stored: false, duplicate: true };
      }

      throw error;
    }

    scheduleProcessing(event.id);

    return { stored: true, duplicate: false, eventId: event.id };
  },
};
