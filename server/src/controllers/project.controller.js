import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import mongoose from "mongoose";
import { addMemberEmail, sendMail } from "../utils/mail.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import fs from "fs/promises";
import { uploadToCloudnary } from "../utils/cloudinary.js";

const creatProject = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(
      401,
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
    delete sendProject.memebers;

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
      401,
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
    throw new ApiError(400, "", "updation of the project was unsuccessfull");
  }

  const sendProject = projectToUpdate.toObject();
  delete sendProject.admins;
  delete sendProject.projectManagers;
  delete sendProject.memebers;

  res
    .status(201)
    .json(new ApiResponse(201, sendProject, "project is updated successfully"));
});

//can be accessed by
const getTheProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "", "projectid to access the project info");
  }
  const project = await Project.findById(projectId).select(
    "projectName projectDescription _id",
  );
  if (!project) {
    throw new ApiError(404, "", "The porject with given id does not exists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, project, "the project is fetched successfully"));
});

const listAllTheProject = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const projects = await Project.aggregate([
    {
      $match: {
        $or: [
          { member: new mongoose.Types.ObjectId(user._id) },
          { admins: new mongoose.Types.ObjectId(user._id) },
          { projectManagers: new mongoose.Types.ObjectId(user._id) },
        ],
      },
    },
    {
      $project: {
        projectName: 1,
      },
    },
  ]);

  if (!projects) {
    throw new ApiError(401, "", "something went wrong");
  }

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
  const link = `${process.env.projectDomain}/${projectId}/join-project`;
  let htmlContent = await fs.readFile("./public/html/joinCreate.html", "utf-8");
  htmlContent = htmlContent.replace("{{ACTION_LINK}}", link);
  htmlContent = htmlContent.replace("{{EMAIL}}", email);

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
      // addMemberTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw "User is not found";
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
    throw new ApiError(500, error, "something went wrong");
  }
});

const getTheMembers = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "", "the project id is required");
  }

  const project = await Project.findById(projectId)
    .populate("admins", "name email _id") //takes the user id from the array and then overides the user id with the content
    .populate("projectManagers", "name email _id")
    .populate("members", "name email _id");
  res
    .status(200)
    .json(new ApiResponse(200, project, "Data fetched successfuly"));
});

const removeTheMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId } = req.body;
  if (!projectId) {
    throw new ApiError(400, "", "the project id is required");
  }


  if (userId == req.user._id) {
    throw new ApiError(401, "", "admin cannot be removed");
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
    throw new ApiError(400, error, "something went while deleting the member");
  }
});

const changeRoles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  if (!projectId) {
    throw new ApiError(400, "", "the project id is required");
  }
  if(userId == req.user._id){
    throw new ApiError(401,"","you can not asign youself a role");
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
    } else {
      await Project.findByIdAndUpdate(projectId, {
        $addToSet: {
          projectManagers: userId,
        },
      });
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
    throw new ApiError(400, error, "something went while deleting the member");
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
  changeRoles
};
