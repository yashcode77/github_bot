import { ruleService } from "../services/rule.service.js";

export const ruleController = {
  async listRules(req, res, next) {
    try {
      const rules = await ruleService.listRules(req.userId, {
        repositoryId: req.query.repositoryId,
      });

      res.json({ rules });
    } catch (error) {
      next(error);
    }
  },

  async createRule(req, res, next) {
    try {
      const rule = await ruleService.createRule(req.userId, req.body);
      res.status(201).json({ rule });
    } catch (error) {
      next(error);
    }
  },

  async updateRule(req, res, next) {
    try {
      const rule = await ruleService.updateRule(
        req.userId,
        req.params.id,
        req.body,
      );
      res.json({ rule });
    } catch (error) {
      next(error);
    }
  },

  async deleteRule(req, res, next) {
    try {
      await ruleService.deleteRule(req.userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
