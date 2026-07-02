import passport from "../config/passport.js";
import { env } from "../config/env.js";
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
        next(err);
        return;
      }

      if (!user) {
        res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
        return;
      }

      try {
        const tokens = await authService.issueTokens(user.id);
        setAuthCookies(res, tokens);
        res.redirect(`${env.FRONTEND_URL}/dashboard`);
      } catch (error) {
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
};
