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
  const {taskId} = req.params;

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
        new ApiResponse(201, createdsubTask, "The sub task is added successfully"),
      );
  } catch (error) {
    throw new ApiError(
      500,
      error,
      "Something went wrong while creating the task",
    );
  }
});




export {createAnSubTask};
