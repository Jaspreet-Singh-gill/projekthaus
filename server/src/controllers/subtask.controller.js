import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { SubTask } from "../models/subtask.model.js";
import { sendMail, assignedEmail } from "../utils/mail.js";
import {
  deleteFromCloudinary,
  uploadToCloudnary,
} from "../utils/cloudinary.js";

const createAnSubTask = asyncHandler(async (req, res, next) => {
  const project = req.project;
  const { taskId } = req.params;

  const { name, description, startDate, endDate, priority, status, progress } =
    req.body;
  try {
    const createdsubTask = await SubTask.create({
      name,
      projectId: project._id,
      description,
      taskId,
      startDate,
      endDate,
      priority,
      status,
      progress,
    });

    if (!name) {
      throw new ApiError(400, "", "Name of the task is required");
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdsubTask,
          "The sub task is added successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(
      500,
      error,
      "Something went wrong while creating the task",
    );
  }
});

const updateSubTask = asyncHandler(async (req, res, next) => {
  const { subTaskId, taskId } = req.params;
  const { name, description, startDate, endDate, priority, status, progress } =
    req.body;

  if (!subTaskId || !taskId) {
    throw new ApiError(401, "", "SubtasId is required to update the task");
  }
  try {
    if (!name) {
      throw new ApiError(400, "", "Name of the task is required");
    }

    const updated = await SubTask.findOneAndUpdate(
      {
        _id: subTaskId,
        taskId,
      },
      {
        $set: {
          name,
          description,
          startDate,
          endDate,
          priority,
          status,
          progress,
        },
      },
      {
        new: true,
      },
    );

    res
      .status(200)
      .json(new ApiResponse(200, updated, "the task is updated successfully"));
  } catch (error) {
    throw new ApiError(500, "", "Something went wrong while updating the task");
  }
});

const deleteSubTask = asyncHandler(async (req, res, next) => {
  const { taskId, subTaskId } = req.params;
  if (!taskId || !subTaskId) {
    throw new ApiError(
      401,
      "",
      "tasId and subtaskId both are required to update the task",
    );
  }

  try {
    const deleted = await SubTask.findOneAndDelete({
      _id: subTaskId,
      taskId,
    });

    res
      .status(300)
      .json(new ApiResponse(300, "", "The task is deleted successFully"));
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong while deleting");
  }
});

const getTheSubTask = asyncHandler(async (req, res, next) => {
  const { taskId, subTaskId } = req.params;
  if (!taskId || !subTaskId) {
    throw new ApiError(
      401,
      "",
      "SubtasId and taskId both are required to update the task",
    );
  }

  const task = await SubTask.findOne({ _id: subTaskId, taskId });
  if (!task) {
    throw new ApiError(404, "", "SubTask not found with the given task id");
  }

  res
    .status(200)
    .json(new ApiResponse(200, task, "The Subtask is fetched successfully"));
});

const getAllTheSubTask = asyncHandler(async (req, res, next) => {
  const { taskId} = req.params;
  if (!taskId) {
    throw new ApiError(
      401,
      "",
      "taskId is required to update the task",
    );
  }
  const Subtasks = await SubTask.find({
    projectId: req.project._id,
    taskId
  });

  if (!Subtasks) {
    throw new ApiError(400, "", "The Subtasks are empty");
  }

  res
    .status(200)
    .json(new ApiResponse(200, Subtasks, "List of Subtasks had been sended"));
});

export { 
    createAnSubTask,
    updateSubTask,
    deleteSubTask,
    getTheSubTask,
    getAllTheSubTask

 };
