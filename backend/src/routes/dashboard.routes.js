import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/overview", dashboardController.getOverview);
router.get("/events", dashboardController.listEvents);
router.get("/actions", dashboardController.listActions);
router.get("/repositories", dashboardController.listRepositories);
router.get("/stats", dashboardController.getStats);

export default router;
