import { encryptToken, generateRefreshToken, hashRefreshToken } from "../lib/crypto.js";
import { signAccessToken } from "../lib/jwt.js";
import { env } from "../config/env.js";
import { refreshTokenRepository, userRepository } from "../repositories/index.js";
import { UnauthorizedError } from "../lib/errors.js";

function refreshTokenExpiresAt() {
  return new Date(
    Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );
}

export function toPublicUser(user) {
  return {
    id: user.id,
    githubId: user.githubId,
    githubLogin: user.githubLogin,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const authService = {
  async findOrCreateFromGithub(profile, accessToken) {
    const { encryptedToken, tokenIv } = encryptToken(accessToken);
    const githubId = Number(profile.id);

    if (!Number.isInteger(githubId)) {
      throw new Error(`Invalid GitHub user id: ${profile.id}`);
    }

    const userData = {
      githubLogin: profile.username,
      displayName: profile.displayName ?? null,
      avatarUrl: profile.photos?.[0]?.value ?? profile._json?.avatar_url ?? null,
      encryptedToken,
      tokenIv,
    };

    const existingUser = await userRepository.findByGithubId(githubId);

    if (existingUser) {
      return userRepository.update(existingUser.id, userData);
    }

    return userRepository.create({
      githubId,
      ...userData,
    });
  },

  async issueTokens(userId) {
    const accessToken = signAccessToken(userId);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: refreshTokenExpiresAt(),
    });

    return { accessToken, refreshToken };
  },

  async revokeRefreshToken(refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await refreshTokenRepository.findValidByHash(tokenHash);

    if (storedToken) {
      await refreshTokenRepository.revoke(storedToken.id);
    }
  },

  async logoutUser(refreshToken) {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }
  },

  async refreshAccessToken(refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken =
      await refreshTokenRepository.findValidByHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError(
        "Invalid or expired refresh token"
      );
    }

    const accessToken = signAccessToken(storedToken.userId);
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    await refreshTokenRepository.revoke(storedToken.id);

    await refreshTokenRepository.create({
      userId: storedToken.userId,
      tokenHash: newTokenHash,
      expiresAt: refreshTokenExpiresAt(),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
};
