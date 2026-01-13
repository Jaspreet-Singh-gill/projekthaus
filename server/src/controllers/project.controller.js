import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";

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
  console.log(project);

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

export { creatProject, updateProject };
