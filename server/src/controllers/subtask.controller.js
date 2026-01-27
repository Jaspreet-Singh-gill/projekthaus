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


const assignSubTask = asyncHandler(async (req, res, next) => {
  const { subTaskId } = req.params;
  const project = req.project;
  if (!subTaskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  const { assignedList } = req.body;
  if (!assignedList) {
    throw new ApiError(401, "", "assigned list members are required");
  }

  //checking multiple assgined user later on

  const subTask = await SubTask.findById(subTaskId);
  if (!subTask) {
    throw new ApiError(500, "", "Something went wrong");
  }
  let arr = assignedList;
  try {
    await Promise.all(
      assignedList.map((obj) => {
        const emailObject = {
          email: obj.email,
          subject: " new assignement ", // increases efficiency by running all the sendMails parallely and saves time
          mailContent: assignedEmail(
            project.projectName,
            "subTask",
            subTask.name,
            "https://google.com",
          ),
        };
        return sendMail(emailObject);
      }),
    );

    arr = [...arr, ...subTask.assigned];

    const combined = new Map(arr.map((obj) => [obj.id.toString(), obj]));
    subTask.assigned = Array.from(combined.values());

    await subTask.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, "", "memeber are assigned to the task"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error, "Something went wrong");
  }
});

const deleteAssignSubTask = asyncHandler(async (req, res, next) => {
  const { subTaskId } = req.params;

  if (!subTaskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  const { assignedMemeberId } = req.body;
  if (!assignedMemeberId) {
    throw new ApiError(401, "", "assigned list members are required");
  }

  const task = await SubTask.findById(subTaskId);
  if (!task) {
    throw new ApiError(500, "", "Something went wrong");
  }
  let arr = task.assigned;
  arr = arr?.filter((user) => user.id != assignedMemeberId);

  task.assigned = arr;

  await task.save({ validateBeforeSave: true });

  res
    .status(200)
    .json(new ApiResponse(200, "", "The user is removed from this SubTask"));
});

const assignedSubTaskUpdation = asyncHandler(async (req, res, next) => {
  const { subTaskId } = req.params;

  if (!subTaskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  const { progress, status } = req.body;
  if (!progress || !status) {
    throw new ApiError(401, "", "progress and status both of them required");
  }
  const user = req.user;

  const task = await SubTask.findById(subTaskId);
  if (!task) {
    throw new ApiError(500, "", "Something went wrong");
  }

  let arr = task.assigned;
  let canChange = false;
  arr?.forEach((obj) => {
    if (obj.id.equals(user._id)) canChange = true;
  });
  if (!canChange) {
    throw new ApiError(
      400,
      "",
      "You cannot update this Subtask as this was not assigned to you",
    );
  }

  task.status = status;
  task.progress = progress;

  await task.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, "", "update is successfull"));
});

export { 
    createAnSubTask,
    updateSubTask,
    deleteSubTask,
    getTheSubTask,
    getAllTheSubTask,
    assignSubTask,
    deleteAssignSubTask,
    assignedSubTaskUpdation

 };
