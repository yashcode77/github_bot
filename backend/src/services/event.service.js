import { logger } from "../config/logger.js";
import { githubEventRepository } from "../repositories/index.js";

const SUPPORTED_EVENTS = new Set([
  "issues:opened",
  "pull_request:opened",
  "push",
]);

function getEventKey(eventType, action) {
  if (eventType === "push") {
    return "push";
  }

  return `${eventType}:${action ?? ""}`;
}

function isSupportedEvent(eventType, action) {
  return SUPPORTED_EVENTS.has(getEventKey(eventType, action));
}

async function handleSupportedEvent(event) {
  logger.info(
    {
      eventId: event.id,
      eventType: event.eventType,
      action: event.action,
      repositoryId: event.repositoryId,
      deliveryId: event.deliveryId,
    },
    "Processing supported GitHub event",
  );
}

export const eventService = {
  async processEvent(eventId) {
    const event = await githubEventRepository.findById(eventId);

    if (!event) {
      logger.warn({ eventId }, "GitHub event not found for processing");
      return;
    }

    if (event.status !== "RECEIVED") {
      logger.info(
        { eventId, status: event.status },
        "Skipping GitHub event that is already handled",
      );
      return;
    }

    logger.info(
      {
        eventId: event.id,
        deliveryId: event.deliveryId,
        eventType: event.eventType,
        action: event.action,
      },
      "GitHub event processing started",
    );

    await githubEventRepository.update(event.id, {
      status: "PROCESSING",
      processingStartedAt: new Date(),
    });

    try {
      if (!isSupportedEvent(event.eventType, event.action)) {
        await githubEventRepository.update(event.id, {
          status: "SKIPPED",
          processedAt: new Date(),
        });

        logger.info(
          {
            eventId: event.id,
            eventType: event.eventType,
            action: event.action,
          },
          "GitHub event processing completed (skipped unsupported event)",
        );

        return;
      }

      await handleSupportedEvent(event);

      await githubEventRepository.update(event.id, {
        status: "PROCESSED",
        processedAt: new Date(),
      });

      logger.info(
        {
          eventId: event.id,
          deliveryId: event.deliveryId,
          eventType: event.eventType,
          action: event.action,
        },
        "GitHub event processing completed",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";

      await githubEventRepository.update(event.id, {
        status: "FAILED",
        processedAt: new Date(),
        errorMessage,
      });

      logger.error(
        {
          err: error,
          eventId: event.id,
          deliveryId: event.deliveryId,
        },
        "GitHub event processing failed",
      );
    }
  },
};
