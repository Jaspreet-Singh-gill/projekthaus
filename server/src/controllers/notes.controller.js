import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Notes } from "../models/notes.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import mongoose from "mongoose";

const createNotes = asyncHandler(async (req, res, next) => {
  const projectId = req.project._id;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "", "There must be something in the content");
  }
  try {
    const createOne = await Notes.create({
      projectId,
      content,
    });

    res
      .status(201)
      .json(new ApiResponse(201, createOne, "Notes are created successfully"));
  } catch (error) {
    throw new ApiError(
      400,
      error,
      "something went wrong while creating the notes",
    );
  }
});

const updateNotes = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;

  if (!noteId) {
    throw new ApiError(400, "", "id of the note is required to update it");
  }
  const { updatedContent } = req.body;
  if (!updatedContent) {
    throw new ApiError(400, "", "some content is required to being updated");
  }

  const updatedNote = await Notes.findByIdAndUpdate(noteId, {
    $set: {
      content: updatedContent,
    },
  });

  if (!updatedContent) {
    throw new ApiError(400, "", "some error has occured while updating");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedContent,
        "the content of notes is updated successfully",
      ),
    );
});

const deleteNotes = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;
  if (!noteId) {
    throw new ApiError(400, "", "id of the note is required to delete it");
  }
  try {
    await Notes.findByIdAndDelete(noteId);
    res
      .status(200)
      .json(new ApiResponse(200, "The note is successfully deleted"));
  } catch (error) {
    throw new ApiError(
      400,
      error,
      "Some error has occured while deleting the notes",
    );
  }
});

const getAllTheNotes = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "", "projectId is required");
  }
  const id = projectId;

  try {
    const listOfNotes = await Notes.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(id),
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, listOfNotes, "notes fetched successfully"));
  } catch (error) {
    throw new ApiError(400, "", "something went wrong");
  }
});

export { createNotes, updateNotes, deleteNotes,getAllTheNotes };
