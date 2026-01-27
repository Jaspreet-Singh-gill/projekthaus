import { Router } from "express";
import {
  createAnSubTask,
  updateSubTask,
  getTheSubTask,
  getAllTheSubTask,
  deleteSubTask,
  assignSubTask,
  deleteAssignSubTask,
  assignedSubTaskUpdation,
  attachFilesToSubTask,
  getAllTheFilesSubTask,
  deleteTheFile,
} from "../controllers/subtask.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  memberOfProject,
  verifyAdminAndProjectManager,
} from "../middlewares/project.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:projectId/:taskId/create-subtask")
  .post(verifyJWT, verifyAdminAndProjectManager, createAnSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/update-subtask")
  .put(verifyJWT, verifyAdminAndProjectManager, updateSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/delete-subtask")
  .delete(verifyJWT, verifyAdminAndProjectManager, deleteSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/get-the-subtask")
  .get(verifyJWT, memberOfProject, getTheSubTask);

router
  .route("/:projectId/:taskId/get-all-subtask")
  .get(verifyJWT, memberOfProject, getAllTheSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/assign-subTask")
  .post(verifyJWT, verifyAdminAndProjectManager, assignSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/delete-assigned")
  .delete(verifyJWT, verifyAdminAndProjectManager, deleteAssignSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/update-assigned-subtask")
  .put(verifyJWT, memberOfProject, assignedSubTaskUpdation);

router
  .route("/:projectId/:taskId/:subTaskId/attach-files-subtask")
  .post(
    verifyJWT,
    upload.array("filesToSend", 5),
    verifyAdminAndProjectManager,
    attachFilesToSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/get-all-files")
  .get(verifyJWT, memberOfProject, getAllTheFilesSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/:fileId/delete-the-file")
  .delete(verifyJWT, verifyAdminAndProjectManager, deleteTheFile);
export default router;
