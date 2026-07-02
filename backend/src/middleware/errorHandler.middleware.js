import { logger } from "../config/logger.js";
import { AppError } from "../lib/errors.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    const body = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details) {
      body.error.details = err.details;
    }

    return res.status(err.statusCode).json(body);
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "A record with this value already exists",
      },
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Record not found",
      },
    });
  }

  logger.error({ err }, "Unhandled error");

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
