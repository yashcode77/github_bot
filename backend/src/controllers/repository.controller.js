import { repositoryService } from "../services/repository.service.js";

export const repositoryController = {
  async listGitHubRepositories(req, res, next) {
    try {
      const repositories = await repositoryService.listGitHubRepositories(
        req.userId,
      );

      res.json({ repositories });
    } catch (error) {
      next(error);
    }
  },

  async connectRepository(req, res, next) {
    try {
      const repository = await repositoryService.connectRepository(
        req.userId,
        req.body,
      );

      res.status(201).json({ repository });
    } catch (error) {
      next(error);
    }
  },

  async disconnectRepository(req, res, next) {
    try {
      const repository = await repositoryService.disconnectRepository(
        req.userId,
        req.params.id,
      );

      res.json({ repository });
    } catch (error) {
      next(error);
    }
  },
};
