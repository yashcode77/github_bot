import { Router } from "express";
import { repositoryController } from "../controllers/repository.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/github", repositoryController.listGitHubRepositories);
router.post("/connect", repositoryController.connectRepository);
router.delete("/:id", repositoryController.disconnectRepository);

export default router;
