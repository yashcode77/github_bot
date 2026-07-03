import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import { env } from "./config/env.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import ruleRoutes from "./routes/rule.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  }),
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/rules", ruleRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
