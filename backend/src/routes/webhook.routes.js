import { Router } from "express";
import express from "express";
import { webhookController } from "../controllers/webhook.controller.js";
import { verifyGithubWebhookSignature } from "../middleware/webhook.middleware.js";

const router = Router();

router.post(
  "/github",
  express.raw({ type: "application/json" }),
  verifyGithubWebhookSignature,
  webhookController.handleGitHubWebhook,
);

export default router;
