import passport from "../config/passport.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { authService, toPublicUser } from "../services/auth.service.js";
import { userRepository } from "../repositories/index.js";
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "../lib/cookies.js";
import { NotFoundError } from "../lib/errors.js";

export const authController = {
  githubLogin(req, res, next) {
    passport.authenticate("github")(req, res, next);
  },

  async githubCallback(req, res, next) {
    passport.authenticate("github", { session: false }, async (err, user) => {
      if (err) {
        logger.warn("GitHub authentication failed");
        res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
        return;
      }

      if (!user) {
        logger.warn("GitHub authentication returned no user");
        res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
        return;
      }

      try {
        const tokens = await authService.issueTokens(user.id);
        setAuthCookies(res, tokens);
        res.redirect(`${env.FRONTEND_URL}/dashboard`);
      } catch (error) {
        logger.error({ err: error }, "Failed to issue tokens");
        next(error);
      }
    })(req, res, next);
  },

  async logout(req, res, next) {
    try {
      await authService.logoutUser(req.cookies[REFRESH_TOKEN_COOKIE]);
      clearAuthCookies(res);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const user = await userRepository.findById(req.userId);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      res.json({ user: toPublicUser(user) });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      console.log("=== REFRESH START ===");
      console.log("cookies:", req.cookies);
  
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  
      console.log("refresh token exists:", !!refreshToken);
  
      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token not found");
      }
  
      console.log("calling authService.refreshAccessToken");
  
      const tokens = await authService.refreshAccessToken(refreshToken);
  
      console.log("tokens generated successfully");
  
      setAuthCookies(res, tokens);
  
      console.log("cookies set successfully");
  
      res.json({ success: true });
    } catch (error) {
      console.error("=== REFRESH ERROR ===");
      console.error(error);
      next(error);
    }
  }
};
