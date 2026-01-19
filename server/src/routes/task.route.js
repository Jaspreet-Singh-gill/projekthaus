import { Router } from "express";
import {
  assignedTaskUpdation,
  assignTask,
  createAnTask,
  deleteAssignTask,
  deleteTask,
  getAllTheTask,
  getTheTask,
  updateTask,
} from "../controllers/task.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  memberOfProject,
  verifyAdminAndProjectManager,
} from "../middlewares/project.middleware.js";

const router = Router();

router
  .route("/:projectId/create-task")
  .post(verifyJWT, verifyAdminAndProjectManager, createAnTask);
router
  .route("/:projectId/:taskId/update-task")
  .put(verifyJWT, verifyAdminAndProjectManager, updateTask);
router
  .route("/:projectId/:taskId/delete-task")
  .delete(verifyJWT, verifyAdminAndProjectManager, deleteTask);
router
  .route("/:projectId/:taskId/get-task")
  .get(verifyJWT, memberOfProject, getTheTask);
router
  .route("/:projectId/get-all-tasks")
  .get(verifyJWT, memberOfProject, getAllTheTask);

router
  .route("/:projectId/:taskId/assign-task")
  .post(verifyJWT, verifyAdminAndProjectManager, assignTask);

router
  .route("/:projectId/:taskId/delete-assigned-member")
  .delete(verifyJWT, verifyAdminAndProjectManager, deleteAssignTask);

router
  .route("/:projectId/:taskId/updationOfTask")
  .put(verifyJWT, memberOfProject, assignedTaskUpdation);

export default router;
