import { settingsService } from "../services/settings.service.js";

export const settingsController = {
  async getSlackSettings(req, res, next) {
    try {
      const settings = await settingsService.getSlackSettings(req.userId);

      res.json({ data: settings });
    } catch (error) {
      next(error);
    }
  },

  async updateSlackSettings(req, res, next) {
    try {
      const settings = await settingsService.updateSlackSettings(
        req.userId,
        req.body,
      );

      res.json({ data: settings });
    } catch (error) {
      next(error);
    }
  },
};
