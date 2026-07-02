import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { env } from "./env.js";
import { authService } from "../services/auth.service.js";
import { logger } from "./logger.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ["read:user", "user:email", "repo", "admin:repo_hook"],
    },
    async (accessToken, _refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateFromGithub(
          profile,
          accessToken,
        );
        done(null, user);
      } catch (error) {
        logger.error({ err: error }, "GitHub OAuth strategy failed");
        done(error);
      }
    },
  ),
);

export default passport;
