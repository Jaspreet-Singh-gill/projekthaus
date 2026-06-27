import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  verifyAdmin,
  memberOfProject,
} from "../middlewares/project.middleware.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  createNotes,
  deleteNotes,
  getAllTheNotes,
  getTheNote,
  updateNotes,
  attachFiles,
  getAllTheFiles,
  deleteTheFile,
} from "../controllers/notes.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/:projectId/create-note")
  .post(verifyJWT, verifyAdmin, upload.array("filesToSend", 5), createNotes);
router
  .route("/:projectId/:noteId/update-note")
  .put(verifyJWT, verifyAdmin, updateNotes);
router
  .route("/:projectId/:noteId/delete-note")
  .delete(verifyJWT, verifyAdmin, deleteNotes);
router
  .route("/:projectId/list-notes")
  .get(verifyJWT, memberOfProject, getAllTheNotes);
router
  .route("/:projectId/:noteId/get-note")
  .get(verifyJWT, memberOfProject, getTheNote);

router
  .route("/:projectId/:noteId/attach-files")
  .post(verifyJWT, verifyAdmin, upload.array("filesToSend", 5), attachFiles);

router
  .route("/:projectId/:noteId/files")
  .get(verifyJWT, memberOfProject, getAllTheFiles);
  
router
  .route("/:projectId/:noteId/files/:fileId")
  .delete(verifyJWT, verifyAdmin, deleteTheFile);

export default router;
