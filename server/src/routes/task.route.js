import { Router } from "express";
import { createAnTask, deleteTask, updateTask } from "../controllers/task.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { verifyAdminAndProjectManager } from "../middlewares/project.middleware.js";

const router = Router();

router.route("/:projectId/create-task").post(verifyJWT,verifyAdminAndProjectManager,createAnTask);
router.route("/:projectId/:taskId/update-task").put(verifyJWT,verifyAdminAndProjectManager,updateTask);
router.route("/:projectId/:taskId/delete-task").delete(verifyJWT,verifyAdminAndProjectManager,deleteTask);

export default router;
