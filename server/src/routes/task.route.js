import { Router } from "express";
import { createAnTask } from "../controllers/task.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { verifyAdminAndProjectManager } from "../middlewares/project.middleware.js";

const router = Router();

router.route("/:projectId/create-task").post(verifyJWT,verifyAdminAndProjectManager,createAnTask);

export default router;
