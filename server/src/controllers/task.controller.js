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

export { createAnTask };
