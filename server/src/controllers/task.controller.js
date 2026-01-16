import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.model.js";

const createAnTask = asyncHandler(async (req, res, next) => {
  const project = req.project;
  const { name, description, startDate, endDate, priority, status, progress } =
    req.body;
  try {
    const createdTask = await Task.create({
      name,
      projectId: project._id,
      description,
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
        new ApiResponse(201, createdTask, "The task is added successfully"),
      );
  } catch (error) {
    throw new ApiError(
      500,
      error,
      "Something went wrong while creating the task",
    );
  }
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { name, description, startDate, endDate, priority, status, progress } =
    req.body;

  if (!taskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  try {
    if (!name) {
      throw new ApiError(400, "", "Name of the task is required");
    }

    const updated = await Task.findByIdAndUpdate(
      taskId,
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

const deleteTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  if (!taskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }

  try {
    const deleted = await Task.findByIdAndDelete(taskId);

    res
      .status(300)
      .json(new ApiResponse(300, "", "The task is deleted successFully"));
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong while deleting");
  }
});
export { createAnTask, updateTask, deleteTask };
