import { verifyAccessToken } from "../lib/jwt.js";
import { ACCESS_TOKEN_COOKIE } from "../lib/cookies.js";
import { UnauthorizedError } from "../lib/errors.js";

export function requireAuth(req, _res, next) {
  try {
    console.log("=== AUTH MIDDLEWARE ===");
    console.log("cookies:", req.cookies);

    const token = req.cookies[ACCESS_TOKEN_COOKIE];

    console.log("hasToken:", !!token);

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const payload = verifyAccessToken(token);

    console.log("payload:", payload);

    req.userId = payload.sub;

    console.log("userId:", req.userId);

    next();
  } catch (error) {
    console.error("AUTH ERROR:");
    console.error(error);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Invalid or expired access token"));
      return;
    }

    next(error);
  }
}
