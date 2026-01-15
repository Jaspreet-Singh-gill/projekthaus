import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/project.middleware.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  createNotes,
  deleteNotes,
  getAllTheNotes,
  getTheNote,
  updateNotes,
} from "../controllers/notes.controller.js";

const router = Router();

router
  .route("/:projectId/create-note")
  .post(verifyJWT, verifyAdmin, createNotes);
router
  .route("/:projectId/:noteId/update-note")
  .put(verifyJWT, verifyAdmin, updateNotes);
router
  .route("/:projectId/:noteId/delete-note")
  .delete(verifyJWT, verifyAdmin, deleteNotes);
router.route("/:projectId/list-notes").get(getAllTheNotes);
router.route("/:projectId/:noteId/get-note").get(getTheNote);

export default router;
