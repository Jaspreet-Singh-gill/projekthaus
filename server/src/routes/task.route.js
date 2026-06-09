import { Router } from "express";
import {
  assignedTaskUpdation,
  assignTask,
  attachFiles,
  createAnTask,
  deleteAssignTask,
  deleteTask,
  getAllTheTask,
  getTheTask,
  updateTask,
  getAllTheFiles,
  deleteTheFile,
} from "../controllers/task.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  memberOfProject,
  verifyAdminAndProjectManager,
  isTaskBelongsToProject
} from "../middlewares/project.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:projectId/create-task")
  .post(verifyJWT, verifyAdminAndProjectManager, createAnTask);
router
  .route("/:projectId/:taskId/update-task")
  .put(verifyJWT, verifyAdminAndProjectManager,isTaskBelongsToProject,updateTask);
router
  .route("/:projectId/:taskId/delete-task")
  .delete(verifyJWT, verifyAdminAndProjectManager,isTaskBelongsToProject,deleteTask);
router
  .route("/:projectId/:taskId/get-task")
  .get(verifyJWT, memberOfProject,isTaskBelongsToProject,getTheTask);
router
  .route("/:projectId/get-all-tasks")
  .get(verifyJWT, memberOfProject, getAllTheTask);

router
  .route("/:projectId/:taskId/assign-task")
  .post(verifyJWT, verifyAdminAndProjectManager,isTaskBelongsToProject, assignTask);

router
  .route("/:projectId/:taskId/delete-assigned-member")
  .delete(
    verifyJWT,
    verifyAdminAndProjectManager,
    isTaskBelongsToProject,deleteAssignTask,
  );

router
  .route("/:projectId/:taskId/updationOfTask")
  .put(verifyJWT, memberOfProject,isTaskBelongsToProject,assignedTaskUpdation);

router
  .route("/:projectId/:taskId/attach-files")
  .post(
    verifyJWT,
    verifyAdminAndProjectManager,
    isTaskBelongsToProject,
    upload.array("filesToSend", 5),
    attachFiles,
  );

router
  .route("/:projectId/:taskId/get-all-files")
  .get(verifyJWT, memberOfProject,isTaskBelongsToProject, getAllTheFiles);

router
  .route("/:projectId/:taskId/:fileId/delete-the-file")
  .delete(verifyJWT, verifyAdminAndProjectManager,isTaskBelongsToProject,deleteTheFile);

export default router;
