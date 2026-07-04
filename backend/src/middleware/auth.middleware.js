import { verifyAccessToken } from "../lib/jwt.js";
import { ACCESS_TOKEN_COOKIE } from "../lib/cookies.js";
import { UnauthorizedError } from "../lib/errors.js";

export function requireAuth(req, _res, next) {
  try {
    const token = req.cookies[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const payload = verifyAccessToken(token);
    req.userId = payload.sub;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Invalid or expired access token"));
      return;
    }

    next(error);
  }
}
