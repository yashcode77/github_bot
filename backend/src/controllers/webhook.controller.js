import { webhookService } from "../services/webhook.service.js";

export const webhookController = {
  async handleGitHubWebhook(req, res, next) {
    try {
      const deliveryId = req.headers["x-github-delivery"];
      const eventType = req.headers["x-github-event"];

      const result = await webhookService.handleGitHubWebhook({
        deliveryId,
        eventType,
        rawBody: req.body,
      });

      res.status(200).json({
        received: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
