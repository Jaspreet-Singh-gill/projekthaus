import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.model.js";
import { Notification } from "../models/notification.model.js";
import { Comment } from "../models/comment.model.js";
import { io } from "../index.js";
import { sendMail, assignedEmail } from "../utils/mail.js";
import { taskFile } from "../models/taskfile.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudnary,
} from "../utils/cloudinary.js";

const createAnTask = asyncHandler(async (req, res, next) => {
  const project = req.project;
  const { name, description, startDate, endDate, priority, status, progress } =
    req.body;
  if (!name) {
    throw new ApiError(400, "", "Name of the task is required");
  }
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

    const recipients = [...new Set([
      ...(project.admins || []),
      ...(project.projectManagers || []),
      ...(project.members || [])
    ])].filter(id => id.toString() !== req.user._id.toString());
    
    for (const recipientId of recipients) {
      const notification = await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type: "TASK_CREATED",
        message: `New task "${name}" was created in project "${project.projectName}".`,
        link: `/project/${project._id}/task/${createdTask._id}`,
        projectId: project._id,
        taskId: createdTask._id,
      });
      io.to(`user_${recipientId.toString()}`).emit("new_notification", notification);
    }
    io.to(`project_${project._id.toString()}`).emit("task_created", createdTask);

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
    throw new ApiError(400, "", "tasId is required to update the task");
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

    let targets = req.project.projectManagers || [];
    if (targets.length === 0) {
      targets = req.project.admins || [];
    }
    targets = targets.filter(id => id.toString() !== req.user._id.toString());
    for (const targetId of targets) {
      const notification = await Notification.create({
        recipient: targetId,
        sender: req.user._id,
        type: "TASK_UPDATED",
        message: `Task "${name}" was updated.`,
        link: `/project/${req.project._id}/task/${taskId}`,
        projectId: req.project._id,
        taskId: taskId,
      });
      io.to(`user_${targetId.toString()}`).emit("new_notification", notification);
    }
    io.to(`project_${req.project._id.toString()}`).emit("task_updated", updated);

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
    throw new ApiError(400, "", "tasId is required to update the task");
  }

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "", "Task not found");
    }

    const files = await taskFile.find({
      taskId,
    });

    if (files.length > 0) {
      await Promise.all(
        files.map((file) => deleteFromCloudinary(file.publicId, file.fileKind)),
      );
    }
    await taskFile.deleteMany({ taskId });
    await Comment.deleteMany({ taskId });
    await Notification.deleteMany({ taskId });
    await Task.findByIdAndDelete(taskId);

    io.to(`project_${req.project._id.toString()}`).emit("task_deleted", { taskId });

    res
      .status(200)
      .json(new ApiResponse(200, "", "The task is deleted successFully"));
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong while deleting");
  }
});

const getTheTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  if (!taskId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }

  const task = req.task;
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

  res
    .status(200)
    .json(new ApiResponse(200, tasks, "List of tasks had been sended"));
});

//assigned task

const assignTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const project = req.project;
  if (!taskId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }
  const { assignedList } = req.body;
  if (!assignedList) {
    throw new ApiError(400, "", "assigned list members are required");
  }

  //checking multiple assgined user later on

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "", "Task not found");
  }
  let arr = assignedList;
  try {
    await Promise.all(
      assignedList.map(async (obj) => {
        const emailObject = {
          email: obj.email,
          subject: " new assignement ", 
          mailContent: assignedEmail(
            project.projectName,
            "task",
            task.name,
            `${process.env.SITE_MAIN_URL}/project/${project._id}/task/${taskId}`,
          ),
        };
        await sendMail(emailObject);

        const notification = await Notification.create({
          recipient: obj.id,
          sender: req.user._id,
          type: "ASSIGNMENT",
          message: `You have been assigned to task "${task.name}".`,
          link: `/project/${project._id}/task/${taskId}`,
          projectId: project._id,
          taskId: taskId,
        });
        io.to(`user_${obj.id.toString()}`).emit("new_notification", notification);
      }),
    );
    
    io.to(`project_${req.project._id.toString()}`).emit("task_updated", task);

    arr = [...arr, ...task.assigned];

    const combined = new Map(arr.map((obj) => [obj.id.toString(), obj]));
    task.assigned = Array.from(combined.values());

    await task.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, "", "memeber are assigned to the task"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error, "Something went wrong");
  }
});

const deleteAssignTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }
  const { assignedMemeberId } = req.body;
  if (!assignedMemeberId) {
    throw new ApiError(400, "", "assigned list members are required");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "", "Task not found");
  }
  let arr = task.assigned;
  arr = arr?.filter((user) => user.id != assignedMemeberId);

  task.assigned = arr;

  await task.save({ validateBeforeSave: true });
  
  io.to(`project_${req.project._id.toString()}`).emit("task_updated", task);

  res
    .status(200)
    .json(new ApiResponse(200, "", "The user is removed from this task"));
});

const assignedTaskUpdation = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }
  const { progress, status } = req.body;
  if ((!progress && progress != 0) || !status) {
    throw new ApiError(400, "", "progress and status both of them required");
  }
  const user = req.user;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "", "Task not found");
  }

  let arr = task.assigned;
  let canChange = false;
  arr?.forEach((obj) => {
    if (obj.id.equals(user._id)) canChange = true;
  });
  if (!canChange) {
    throw new ApiError(
      403,
      "",
      "You cannot update this task as this was not assigned to you",
    );
  }

  task.status = status;
  task.progress = progress;

  await task.save({ validateBeforeSave: false });

  let targets = req.project.projectManagers || [];
  if (targets.length === 0) {
    targets = req.project.admins || [];
  }
  targets = targets.filter(id => id.toString() !== user._id.toString());
  for (const targetId of targets) {
    const notification = await Notification.create({
      recipient: targetId,
      sender: user._id,
      type: "TASK_UPDATED",
      message: `Task "${task.name}" progress/status was updated.`,
      link: `/project/${req.project._id}/task/${taskId}`,
      projectId: req.project._id,
      taskId: taskId,
    });
    io.to(`user_${targetId.toString()}`).emit("new_notification", notification);
  }
  
  io.to(`project_${req.project._id.toString()}`).emit("task_updated", task);

  res.status(200).json(new ApiResponse(200, "", "update is successfull"));
});

const attachFiles = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  if (!taskId) {
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
      return await taskFile.create({
        url: response.url,
        taskId: taskId,
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
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(400, "", "tasId is required to update the task");
  }

  const files = await taskFile.find({
    taskId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, files, "Files are sended successfully"));
});

const deleteTheFile = asyncHandler(async (req, res, next) => {
  const { taskId, fileId } = req.params;

  if (!taskId || !fileId) {
    throw new ApiError(
      400,
      "",
      "tasId  and fileId both are required to delete the file from this task",
    );
  }
  try {
    const file = await taskFile.findById(fileId);
    if (!file) throw new ApiError(404, "", "file does not exists");
    const deletedTaskFile = await taskFile.findByIdAndDelete(fileId);

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
  createAnTask,
  updateTask,
  deleteTask,
  getTheTask,
  getAllTheTask,
  assignTask,
  deleteAssignTask,
  assignedTaskUpdation,
  attachFiles,
  getAllTheFiles,
  deleteTheFile,
};
