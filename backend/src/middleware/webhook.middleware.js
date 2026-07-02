import crypto from "crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

function computeSignature(rawBody, secret) {
  return `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
}

function timingSafeCompare(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

export function verifyGithubWebhookSignature(req, res, next) {
  const signature = req.headers["x-hub-signature-256"];

  if (!signature || typeof signature !== "string") {
    logger.warn("GitHub webhook rejected: missing signature");
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing webhook signature",
      },
    });
  }

  const rawBody = req.body;

  if (!Buffer.isBuffer(rawBody)) {
    logger.error("GitHub webhook rejected: raw body not available for verification");
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid webhook payload",
      },
    });
  }

  const expectedSignature = computeSignature(rawBody, env.GITHUB_WEBHOOK_SECRET);

  if (!timingSafeCompare(signature, expectedSignature)) {
    logger.warn("GitHub webhook rejected: invalid signature");
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid webhook signature",
      },
    });
  }

  next();
}
