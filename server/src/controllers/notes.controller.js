import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Notes } from "../models/notes.model.js";
import { Notification } from "../models/notification.model.js";
import { io } from "../index.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import mongoose from "mongoose";
import {
  deleteFromCloudinary,
  uploadToCloudnary,
} from "../utils/cloudinary.js";
import { taskFile as noteFile } from "../models/taskfile.model.js";

const createNotes = asyncHandler(async (req, res, next) => {
  const projectId = req.project._id;
  const { content, title, category, isPinned } = req.body;
  const files = req.files;
  if (!content && !title && !category) {
    throw new ApiError(400, "", "There must be something in the notes");
  }

  const createOne = await Notes.create({
    projectId,
    content,
    category,
    isPinned,
    title,
    createdBy: req.user._id,
  });

  if (!createOne) throw new ApiError(500, "", "the creation of note failed");

  const recipients = [...new Set([
    ...(req.project.admins || []),
    ...(req.project.projectManagers || []),
    ...(req.project.members || [])
  ])].filter(id => id.toString() !== req.user._id.toString());
  
  for (const recipientId of recipients) {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: "NOTE_CREATED",
      message: `A new note "${title || category}" was created.`,
      link: `/project/${projectId}/${createOne._id}/note`,
      projectId: projectId,
    });
    io.to(`user_${recipientId.toString()}`).emit("new_notification", notification);
  }
  
  io.to(`project_${projectId.toString()}`).emit("note_created", createOne);

  if (files && files.length > 0) {
    await Promise.all(
      files.map(async (obj) => {
        const response = await uploadToCloudnary(obj);
        await noteFile.create({
          url: response.url,
          taskId: createOne._id,
          fileName: obj.originalname,
          fileKind: response.resource_type,
          publicId: response.public_id,
        });
      }),
    );
  }

  res
    .status(201)
    .json(new ApiResponse(201, createOne, "Notes are created successfully"));
});

const updateNotes = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;

  if (!noteId) {
    throw new ApiError(400, "", "id of the note is required to update it");
  }
  const { content, title, category, isPinned } = req.body;
  if (!content && !title && !category && isPinned == null) {
    throw new ApiError(400, "", "some content is required to being updated");
  }
  const updatedNote = await Notes.findOneAndUpdate(
    { _id: noteId },
    {
      $set: {
        content,
        title,
        category,
        isPinned,
      },
    },
    { new: true },
  );

  if (!updatedNote) {
    throw new ApiError(404, "", "Note not found in this project");
  }

  io.to(`project_${updatedNote.projectId.toString()}`).emit("note_updated", updatedNote);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedNote,
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
    const files = await noteFile.find({
      taskId: noteId,
    });

    if (files && files.length > 0) {
      await Promise.all(
        files.map((file) => deleteFromCloudinary(file.publicId, file.fileKind)),
      );
    }
    const note = await Notes.findOne({ _id: noteId });
    if(note) {
      await noteFile.deleteMany({ taskId: noteId });
      await Notes.findOneAndDelete({ _id: noteId });
      io.to(`project_${note.projectId.toString()}`).emit("note_deleted", { noteId });
    }
    res
      .status(200)
      .json(new ApiResponse(200, [], "The note is successfully deleted"));
  } catch (error) {
    throw new ApiError(
      500,
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
    throw new ApiError(500, "", "something went wrong");
  }
});

const getTheNote = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;
  if (!noteId) {
    throw new ApiError(400, "", "Note id is required");
  }

  const note = await Notes.findById(noteId);
  if (!note) {
    throw new ApiError(404, " ", "Note does not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, note, "The note is fetched successfully"));
});

const attachFiles = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;

  if (!noteId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }

  if (!req.files || req.files.length == 0) {
    throw new ApiError(400, "", "Files are required to send to the cloud");
  }

  try {
    const uploadArrayOfFiles = req.files.map(async (obj) => {
      const response = await uploadToCloudnary(obj.path);
      if (!response)
        throw new ApiError(502, "", "file upload failed try again latter");
      return await noteFile.create({
        url: response.url,
        taskId: noteId,
        fileName: obj.originalname,
        fileKind: response.resource_type,
        publicId: response.public_id,
      });
    });

    await Promise.all(uploadArrayOfFiles);

    res
      .status(201)
      .json(
        new ApiResponse(201, "", "Files are successFully attached to the task"),
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(500, error, "Something went wrong");
  }
});

//can be accessed by any member of the project task
const getAllTheFiles = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;

  if (!noteId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }

  const files = await noteFile.find({
    taskId: noteId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, files, "Files are sended successfully"));
});

const deleteTheFile = asyncHandler(async (req, res, next) => {
  const { noteId, fileId } = req.params;

  if (!noteId || !fileId) {
    throw new ApiError(
      400,
      "",
      "tasId  and fileId both are required to delete the file from this task",
    );
  }
  try {
    const file = await noteFile.findById(fileId);
    if (!file) throw new ApiError(404, "", "file does not exists");
    const deletedTaskFile = await noteFile.findByIdAndDelete(fileId);

    await deleteFromCloudinary(file.publicId, file.fileKind);

    res
      .status(200)
      .json(new ApiResponse(200, "", "The file is deleted successFully"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(
      500,
      error,
      "Something went wrong when deleting the file",
    );
  }
});

export {
  createNotes,
  updateNotes,
  deleteNotes,
  getAllTheNotes,
  getTheNote,
  attachFiles,
  getAllTheFiles,
  deleteTheFile,
};
