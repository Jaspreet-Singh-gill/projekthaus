import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { asyncHandler } from "../utils/aysncHandler.js";

const verifyAdmin = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params; //get the projectId from the url
  const user = req.user; //get the verified user from the verifyJWT middleware there it is already being checked

  if (!projectId) {
    throw new ApiError(400, "", "project id is required to access the project");
  }

  const project = await Project.aggregate([
    //pipline first
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
        admins: new mongoose.Types.ObjectId(user._id),
      },
    },
  ]);

  if (!project || project.length == 0) {
    throw new ApiError(
      403,
      [],
      "you are not autherized to update the project or the project does not exist",
    );
  }

  req.project = project[0];

  next();
});

const verifyAdminAndProjectManager = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params; //get the projectId from the url
  const user = req.user; //get the verified user from the verifyJWT middleware there it is already being checked

  if (!projectId) {
    throw new ApiError(400, "", "project id is required to access the project");
  }

  const project = await Project.aggregate([
    {
      //pipline 1
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
        $or: [
          { admins: new mongoose.Types.ObjectId(user._id) },
          { projectManagers: new mongoose.Types.ObjectId(user._id) },
        ],
      },
    },
  ]);

  if (!project || project.length == 0) {
    throw new ApiError(400, "", "unautherized to access this route");
  }

  req.project = project[0];
  next();
});



export { verifyAdmin, verifyAdminAndProjectManager };
