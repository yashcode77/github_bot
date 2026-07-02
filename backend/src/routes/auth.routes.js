import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/github", authController.githubLogin);
router.get("/github/callback", authController.githubCallback);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.getCurrentUser);

export default router;
