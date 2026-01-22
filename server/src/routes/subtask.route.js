import { Router } from "express";
import { createAnSubTask } from "../controllers/subtask.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  memberOfProject,
  verifyAdminAndProjectManager,
} from "../middlewares/project.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:projectId/:taskId/create-subtask")
  .post(verifyJWT,verifyAdminAndProjectManager, createAnSubTask);



  
export default router;
