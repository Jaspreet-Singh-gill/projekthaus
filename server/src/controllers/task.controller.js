import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.model.js";
import { sendMail, assignedEmail } from "../utils/mail.js";

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

const getTheTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  if (!taskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "", "Task not found with the given task id");
  }

  res
    .status(200)
    .json(new ApiResponse(200, task, "The task is fetched successfully"));
});

const getAllTheTask = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find({
    projectId: req.project._id,
  });

  if (!tasks) {
    throw new ApiError(400, "", "The tasks are empty");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tasks, "List of tasks had been sended"));
});

//assigned task

const assignTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const project = req.project;
  if (!taskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  const { assignedList } = req.body;
  if (!assignedList) {
    throw new ApiError(401, "", "assigned list members are required");
  }

  //checking multiple assgined user later on

  const task = await Task.findById(taskId);
  if (!task) {
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
            "task",
            task.name,
            "https://google.com",
          ),
        };
        return sendMail(emailObject);
      }),
    );

    arr = [...arr, ...task.assigned];

    const combined = new Map(arr.map((obj) => [obj.id.toString(), obj]));
    task.assigned = Array.from(combined.values());

    await task.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, "", "memeber are assigned to the task"));
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong");
  }
});

const deleteAssignTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  const { assignedMemeberId } = req.body;
  if (!assignedMemeberId) {
    throw new ApiError(401, "", "assigned list members are required");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(500, "", "Something went wrong");
  }
  let arr = task.assigned;
  arr = arr?.filter((user) => user.id != assignedMemeberId);

  task.assigned = arr;

  await task.save({ validateBeforeSave: true });

  res
    .status(200)
    .json(new ApiResponse(200, "", "The user is removed from this task"));
});

const assignedTaskUpdation = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(401, "", "tasId is required to update the task");
  }
  const { progress, status } = req.body;
  if (!progress || !status) {
    throw new ApiError(401, "", "progress and status both of them required");
  }
  const user = req.user;

  const task = await Task.findById(taskId);
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
      "You cannot update this task as this was not assigned to you",
    );
  }

  task.status = status;
  task.progress = progress;

  await task.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, "", "update is successfull"));
});

export {
  createAnTask,
  updateTask,
  deleteTask,
  getTheTask,
  getAllTheTask,
  assignTask,
  deleteAssignTask,
  assignedTaskUpdation,
};
