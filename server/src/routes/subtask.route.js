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
  isTaskBelongsToProject,
  isSubTaskBelongToProjectTask,
} from "../middlewares/project.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:projectId/:taskId/create-subtask")
  .post(verifyJWT, verifyAdminAndProjectManager, createAnSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/update-subtask")
  .put(
    verifyJWT,
    verifyAdminAndProjectManager,
    isSubTaskBelongToProjectTask,
    updateSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/delete-subtask")
  .delete(
    verifyJWT,
    verifyAdminAndProjectManager,
    isSubTaskBelongToProjectTask,
    deleteSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/get-the-subtask")
  .get(verifyJWT, memberOfProject, isSubTaskBelongToProjectTask, getTheSubTask);

router
  .route("/:projectId/:taskId/get-all-subtask")
  .get(verifyJWT, memberOfProject, isTaskBelongsToProject, getAllTheSubTask);

router
  .route("/:projectId/:taskId/:subTaskId/assign-subTask")
  .post(
    verifyJWT,
    verifyAdminAndProjectManager,
    isSubTaskBelongToProjectTask,
    assignSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/delete-assigned")
  .delete(
    verifyJWT,
    verifyAdminAndProjectManager,
    isSubTaskBelongToProjectTask,
    deleteAssignSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/update-assigned-subtask")
  .put(
    verifyJWT,
    memberOfProject,
    isSubTaskBelongToProjectTask,
    assignedSubTaskUpdation,
  );

router
  .route("/:projectId/:taskId/:subTaskId/attach-files-subtask")
  .post(
    verifyJWT,
    upload.array("filesToSend", 5),
    verifyAdminAndProjectManager,
    isSubTaskBelongToProjectTask,
    attachFilesToSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/get-all-files")
  .get(
    verifyJWT,
    memberOfProject,
    isSubTaskBelongToProjectTask,
    getAllTheFilesSubTask,
  );

router
  .route("/:projectId/:taskId/:subTaskId/:fileId/delete-the-file")
  .delete(
    verifyJWT,
    verifyAdminAndProjectManager,
    isSubTaskBelongToProjectTask,
    deleteTheFile,
  );
export default router;
