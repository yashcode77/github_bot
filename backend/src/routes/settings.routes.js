import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/slack", settingsController.getSlackSettings);
router.put("/slack", settingsController.updateSlackSettings);

export default router;
