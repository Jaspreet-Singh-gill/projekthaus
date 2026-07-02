import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import mongoose from "mongoose";
import { addMemberEmail, sendMail } from "../utils/mail.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import fs from "fs/promises";
import { uploadToCloudnary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { taskFile } from "../models/taskfile.model.js";
import { subTaskFile } from "../models/subtaskFile.model.js";

const creatProject = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(
      400,
      "",
      "The name of the project is required to create it",
    );
  }
  try {
    const project = await Project.create({
      projectName: name,
      projectDescription: description,
      admins: [req.user._id],
    });

    const sendProject = project.toObject();
    delete sendProject.admins;
    delete sendProject.projectManagers;
    delete sendProject.members;

    res
      .status(201)
      .json(
        new ApiResponse(201, sendProject, "project is creaed successfully"),
      );
  } catch (error) {
    throw new ApiError(
      500,
      error,
      "something went wrong while creating the project",
    );
  }
});

const updateProject = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const project = req.project;
  if (!name) {
    throw new ApiError(
      400,
      "",
      "The name of the project is required for updation of it",
    );
  }

  const projectToUpdate = await Project.findByIdAndUpdate(
    project._id,
    {
      $set: {
        projectName: name,
        projectDescription: description,
      },
    },
    {
      new: true,
    },
  );

  if (!projectToUpdate) {
    throw new ApiError(404, "", "updation of the project was unsuccessfull");
  }

  const sendProject = projectToUpdate.toObject();
  delete sendProject.admins;
  delete sendProject.projectManagers;
  delete sendProject.members;

  res
    .status(200)
    .json(new ApiResponse(200, sendProject, "project is updated successfully"));
});

//can be accessed by
const getTheProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = new mongoose.Types.ObjectId(req.user);

  if (!projectId) {
    throw new ApiError(400, "", "projectid to access the project info");
  }
  const project = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $project: {
        _id: 1,
        projectName: 1,
        projectDescription: 1,
        role: {
          $switch: {
            branches: [
              {
                case: { $in: [userId, "$admins"] },
                then: "ADMIN",
              },
              {
                case: { $in: [userId, "$projectManagers"] },
                then: "PROJECT_MANAGER",
              },
              {
                case: { $in: [userId, "$members"] },
                then: "MEMBER",
              },
            ],
            default: null,
          },
        },
      },
    },
  ]);

  const result = project[0];
  if (!result) {
    throw new ApiError(404, "", "The porject with given id does not exists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, "the project is fetched successfully"));
});

const listAllTheProject = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const userId = new mongoose.Types.ObjectId(user._id);

  const projects = await Project.aggregate([
    {
      $match: {
        $or: [
          { members: userId },
          { admins: userId },
          { projectManagers: userId },
        ],
      },
    },
    {
      $project: {
        projectName: 1,
        _id: 1,
        projectDescription: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projects,
        "the list of projects in which user is fetched successfully",
      ),
    );
});

//add member routes

const addMember = asyncHandler(async (req, res, next) => {
  const project = req.project;
  const { memberEmail } = req.body;

  const user = await User.findOne({
    email: memberEmail,
  });

  try {
    let url;
    if (!user) {
      url = `${process.env.projectDomain}/${project._id}/${memberEmail}/htmlForm/`;
    } else {
      const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTempararyTokens();
      user.addMemberToken = hashedToken;
      user.addMemberTokenExpiry = tokenExpiry;
      await user.save({ validateBeforeSave: false });
      url = `${process.env.projectDomain}/${project._id}/join-the-project/${unHashedToken}`;
    }

    //send mail
    const object = {
      email: memberEmail,
      subject: "join the project",
      mailContent: addMemberEmail(project.projectName, url),
    };

    await sendMail(object);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          " ",
          "email had been successfully send to the member",
        ),
      );
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong");
  }
});

const htmlForm = asyncHandler(async (req, res, next) => {
  const { projectId, email } = req.params;
  if (!projectId) {
    throw new ApiError(400, "", "projectId is required");
  }
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const link = `${process.env.projectDomain}/${projectId}/join-project`;
  let htmlContent = await fs.readFile("./public/html/joinCreate.html", "utf-8");
  htmlContent = htmlContent.replace("{{ACTION_LINK}}", link);
  htmlContent = htmlContent.replace("{{EMAIL}}", escapeHtml(email));

  res.status(200).send(htmlContent);
});

const userInaddMember = asyncHandler(async (req, res, next) => {
  const { projectId, token } = req.params;
  if (!projectId || !token) {
    throw new ApiError(400, "", "projectId and token both are required");
  }
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      addMemberToken: hashedToken,
      addMemberTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw new ApiError(401, "", "Invalid or expired invite token");
    }
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          members: user._id,
        },
      },
      {
        new: true,
      },
    );
    if (!project) {
      throw new ApiError(404, "", "The project does not found");
    }
    user.addMemberToken = undefined;
    user.addMemberTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "",
          "congratulation you successFully joined the project",
        ),
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error, "something went wrong");
  }
});

const userNotInaddMember = asyncHandler(async (req, res, next) => {
  const {
    username,
    email,
    password,
    name,
    age,
    gender,
    organization,
    phoneNumber,
  } = req.body;
  const duplicateUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (duplicateUser) {
    throw new ApiError(
      409,
      [],
      "User with this username or email already exists",
    );
  }

  let response = undefined;
  const filePath = req.file?.path;
  if (filePath) response = await uploadToCloudnary(filePath);
  //console.log(response.public_id);
  const object = {
    username,
    email,
    password,
    name,
    age,
    gender,
    organization,
    phoneNumber,
    isEmailVerified: true,
    avatar: {
      url: response?.url,
      publicId: response?.public_id,
    },
  };

  // const user = req.user;
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "", "projectId is required");
  }
  try {
    const user = await User.create(object);
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          members: user._id,
        },
      },
      {
        new: true,
      },
    );
    res
      .status(201)
      .json(new ApiResponse(201, "", "successflly joined the project"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error, "something went wrong");
  }
});

const getTheMembers = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "", "the project id is required");
  }

  const project = await Project.findById(projectId)
    .populate("admins", "name email _id avatar") //takes the user id from the array and then overides the user id with the content
    .populate("projectManagers", "name email _id avatar")
    .populate("members", "name email _id avatar");

  const peopleArray = [];
  project["admins"]?.map((member) => {
    peopleArray.push({ ...member.toObject(), role: "ADMIN" });
  });
  project["projectManagers"]?.map((member) => {
    peopleArray.push({ ...member.toObject(), role: "PROJECT_MANAGER" });
  });
  project["members"]?.map((member) => {
    peopleArray.push({ ...member.toObject(), role: "MEMBER" });
  });

  res
    .status(200)
    .json(new ApiResponse(200, peopleArray, "Data fetched successfuly"));
});

const removeTheMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId } = req.body;
  if (!projectId) {
    throw new ApiError(400, "", "the project id is required");
  }

  if (userId == req.user._id) {
    throw new ApiError(403, "", "you cannot remove youself from the project");
  }

  const projectDetails = await Project.findById(projectId);
  if (!projectDetails) {
    throw new ApiError(
      404,
      "",
      "project with the given project id does not found",
    );
  }

  if (
    projectDetails.admins.length == 1 &&
    projectDetails.admins[0].toString() === userId.toString()
  ) {
    throw new ApiError(
      403,
      "",
      "Admin is the last one so it cannot be removed",
    );
  }
  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          admins: userId,
          projectManagers: userId,
          members: userId,
        },
      },
      {
        new: true,
      },
    );

    res
      .status(200)
      .json(new ApiResponse(200, "", "member is removed from the project"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error, "something went while deleting the member");
  }
});

const changeRoles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  if (!projectId) {
    throw new ApiError(400, "", "the project id is required");
  }
  if (userId == req.user._id) {
    throw new ApiError(403, "", "you can not asign youself a role");
  }

  try {
    await Project.findByIdAndUpdate(projectId, {
      $pull: {
        admins: userId,
        projectManagers: userId,
        members: userId,
      },
    });
    if (role == "ADMIN") {
      await Project.findByIdAndUpdate(projectId, {
        $addToSet: {
          admins: userId,
        },
      });
    } else if (role === "MEMBER") {
      await Project.findByIdAndUpdate(projectId, {
        $addToSet: {
          members: userId,
        },
      });
    } else if (role === "PROJECT_MANAGER") {
      await Project.findByIdAndUpdate(projectId, {
        $addToSet: {
          projectManagers: userId,
        },
      });
    } else {
      throw new ApiError(
        400,
        "",
        "Invalid role. Allowed: ADMIN, MEMBER, PROJECT_MANAGER",
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "",
          "member is assigned to given role in the project",
        ),
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error,
      "something went while updating the member role",
    );
  }
});

const deleteProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "", "Project ID is required to delete the project");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "", "Project not found");
  }

  try {
    const tasks = await Task.find({ projectId });
    const taskIds = tasks.map((task) => task._id);

    const taskFiles = await taskFile.find({ taskId: { $in: taskIds } });
    for (const file of taskFiles) {
      if (file.publicId) {
        await deleteFromCloudinary(file.publicId);
      }
    }
    await taskFile.deleteMany({ taskId: { $in: taskIds } });

    const subTasks = await SubTask.find({ projectId });
    const subTaskIds = subTasks.map((subTask) => subTask._id);

    const subTaskFiles = await subTaskFile.find({ subTaskId: { $in: subTaskIds } });
    for (const file of subTaskFiles) {
      if (file.publicId) {
        await deleteFromCloudinary(file.publicId);
      }
    }
    await subTaskFile.deleteMany({ subTaskId: { $in: subTaskIds } });

    await SubTask.deleteMany({ projectId });
    await Task.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Project and its associated tasks, subtasks, and files have been successfully deleted"));
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong while deleting the project");
  }
});

export {
  creatProject,
  updateProject,
  getTheProject,
  listAllTheProject,
  userInaddMember,
  addMember,
  userNotInaddMember,
  htmlForm,
  getTheMembers,
  removeTheMember,
  changeRoles,
  deleteProject,
};
