import { z } from "zod";
import {
  ConflictError,
  ForbiddenError,
  GitHubApiError,
  NotFoundError,
} from "../lib/errors.js";
import { getUserAccessToken } from "../lib/token.js";
import { validate } from "../lib/validation.js";
import { logger } from "../config/logger.js";
import { repositoryRepository, userRepository } from "../repositories/index.js";
import { githubService } from "./github.service.js";

const connectRepositorySchema = z.object({
  githubRepoId: z.number().int().positive(),
  owner: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

function toPublicRepository(repository) {
  return {
    id: repository.id,
    githubRepoId: repository.githubRepoId,
    owner: repository.owner,
    name: repository.name,
    fullName: repository.fullName,
    isPrivate: repository.isPrivate,
    isActive: repository.isActive,
    connectedAt: repository.connectedAt,
    disconnectedAt: repository.disconnectedAt,
  };
}

async function verifyRepositoryOwnership(userId, owner, name, githubRepoId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (owner !== user.githubLogin) {
    throw new ForbiddenError("You can only connect repositories that you own");
  }

  const accessToken = await getUserAccessToken(userId);
  const githubRepo = await githubService.getRepository(accessToken, owner, name);

  if (githubRepo.id !== githubRepoId) {
    throw new ForbiddenError("Repository details do not match GitHub");
  }

  return { accessToken, githubRepo, user };
}

export const repositoryService = {
  async listGitHubRepositories(userId) {
    const accessToken = await getUserAccessToken(userId);
    const repositories = await githubService.listOwnedRepositories(accessToken);

    return repositories.map((repository) => ({
      id: repository.id,
      name: repository.name,
      owner: repository.owner,
      isPrivate: repository.isPrivate,
    }));
  },

  async connectRepository(userId, payload) {
    const input = validate(connectRepositorySchema, payload);
    const { accessToken, githubRepo } = await verifyRepositoryOwnership(
      userId,
      input.owner,
      input.name,
      input.githubRepoId,
    );

    const existingByGithubId = await repositoryRepository.findByGithubRepoId(
      input.githubRepoId,
    );

    if (existingByGithubId) {
      if (existingByGithubId.userId !== userId) {
        throw new ConflictError("This repository is already connected by another user");
      }

      if (existingByGithubId.isActive) {
        throw new ConflictError("Repository is already connected");
      }
    }

    const existingByName = await repositoryRepository.findByUserAndName(
      userId,
      input.owner,
      input.name,
    );

    if (existingByName?.isActive) {
      throw new ConflictError("Repository is already connected");
    }

    let webhookId;

    try {
      webhookId = await githubService.createWebhook(
        accessToken,
        githubRepo.owner,
        githubRepo.name,
      );
    } catch (error) {
      logger.error(
        { err: error, userId, owner: input.owner, name: input.name },
        "Failed to create GitHub webhook",
      );
      throw error;
    }

    try {
      if (existingByGithubId && existingByGithubId.userId === userId) {
        const repository = await repositoryRepository.update(existingByGithubId.id, {
          webhookId,
          isActive: true,
          disconnectedAt: null,
          isPrivate: githubRepo.isPrivate,
          fullName: githubRepo.fullName,
        });

        return toPublicRepository(repository);
      }

      const repository = await repositoryRepository.create({
        userId,
        githubRepoId: githubRepo.id,
        owner: githubRepo.owner,
        name: githubRepo.name,
        fullName: githubRepo.fullName,
        isPrivate: githubRepo.isPrivate,
        webhookId,
        isActive: true,
      });

      return toPublicRepository(repository);
    } catch (error) {
      try {
        await githubService.deleteWebhook(
          accessToken,
          githubRepo.owner,
          githubRepo.name,
          webhookId,
        );
      } catch (cleanupError) {
        logger.error(
          {
            err: cleanupError,
            userId,
            owner: githubRepo.owner,
            name: githubRepo.name,
            webhookId,
          },
          "Failed to roll back GitHub webhook after repository save error",
        );
      }

      throw error;
    }
  },

  async disconnectRepository(userId, repositoryId) {
    const repository = await repositoryRepository.findByIdForUser(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new NotFoundError("Repository not found");
    }

    if (!repository.isActive) {
      throw new ConflictError("Repository is already disconnected");
    }

    const accessToken = await getUserAccessToken(userId);

    if (repository.webhookId) {
      try {
        await githubService.deleteWebhook(
          accessToken,
          repository.owner,
          repository.name,
          repository.webhookId,
        );
      } catch (error) {
        if (error instanceof GitHubApiError && error.statusCode === 404) {
          logger.warn(
            {
              repositoryId: repository.id,
              webhookId: repository.webhookId,
            },
            "GitHub webhook already removed",
          );
        } else {
          logger.error(
            {
              err: error,
              repositoryId: repository.id,
              webhookId: repository.webhookId,
            },
            "Failed to delete GitHub webhook during disconnect",
          );
          throw error;
        }
      }
    }

    const updatedRepository = await repositoryRepository.update(repository.id, {
      isActive: false,
      disconnectedAt: new Date(),
      webhookId: null,
    });

    return toPublicRepository(updatedRepository);
  },
};
