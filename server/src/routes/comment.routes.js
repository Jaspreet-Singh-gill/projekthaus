import { Router } from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { memberOfProject } from "../middlewares/project.middleware.js";

const router = Router();

router.use(verifyJWT); // Ensure all comment routes are authenticated

// For tasks
router.post("/:projectId/task/:taskId", memberOfProject, addComment);
router.get("/:projectId/task/:taskId", memberOfProject, getComments);

// For subtasks
router.post("/:projectId/subtask/:subtaskId", memberOfProject, addComment);
router.get("/:projectId/subtask/:subtaskId", memberOfProject, getComments);
router.delete("/:projectId/:commentId", memberOfProject, deleteComment);

export default router;
