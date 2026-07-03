import { Router } from "express";
import { ruleController } from "../controllers/rule.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", ruleController.listRules);
router.post("/", ruleController.createRule);
router.put("/:id", ruleController.updateRule);
router.delete("/:id", ruleController.deleteRule);

export default router;
