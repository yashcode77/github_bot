import { dashboardService } from "../services/dashboard.service.js";

export const dashboardController = {
  async getOverview(req, res, next) {
    try {
      console.log("=== GET OVERVIEW ===");
      console.log("userId:", req.userId);
  
      const overview = await dashboardService.getOverview(
        req.userId,
        req.query,
      );
  
      res.json({ overview });
    } catch (error) {
      console.error("GET OVERVIEW ERROR:");
      console.error(error);
  
      next(error);
    }
  },

  async listEvents(req, res, next) {
    try {
      const result = await dashboardService.listEvents(req.userId, req.query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listActions(req, res, next) {
    try {
      const result = await dashboardService.listActions(req.userId, req.query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listRepositories(req, res, next) {
    try {
      console.log("=== LIST REPOSITORIES ===");
      console.log("userId:", req.userId);
  
      const result = await dashboardService.listRepositories(
        req.userId,
        req.query,
      );
  
      res.json(result);
    } catch (error) {
      console.error("LIST REPOSITORIES ERROR:");
      console.error(error);
  
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      console.log("=== GET STATS ===");
      console.log("userId:", req.userId);
      console.log("query:", req.query);
  
      const stats = await dashboardService.getStats(
        req.userId,
        req.query,
      );
  
      res.json({ stats });
    } catch (error) {
      console.error("GET STATS ERROR:");
      console.error(error);
  
      next(error);
    }
  }
};
