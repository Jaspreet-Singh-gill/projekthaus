import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import mongoose from "mongoose";

// Get global user-centric analytics across all projects the user is in
const getGlobalAnalytics = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const userEmail = req.user.email;

  // Find all projects where user is admin, manager, or member
  const projects = await Project.find({
    $or: [
      { admins: userId },
      { projectManagers: userId },
      { members: userId },
    ],
  });

  if (!projects || projects.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        summary: {
          totalProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          overallCompletionRate: 0,
          totalMembersCount: 0,
          overdueTasks: 0,
        },
        projectsBreakdown: [],
        taskStatusDistribution: [
          { name: "TODO", value: 0 },
          { name: "IN PROGRESS", value: 0 },
          { name: "COMPLETED", value: 0 },
        ],
        taskPriorityDistribution: [
          { name: "HIGH", count: 0 },
          { name: "MEDIUM", count: 0 },
          { name: "LOW", count: 0 },
        ],
      }, "No projects found for this user.")
    );
  }

  const projectIds = projects.map((p) => p._id);

  // Fetch all tasks for these projects
  const allTasks = await Task.find({ projectId: { $in: projectIds } });

  // Filter tasks assigned to the current user
  const userTasks = allTasks.filter((t) =>
    t.assigned && t.assigned.some((assignee) => assignee.email === userEmail)
  );

  // 1. Calculate Summary Metrics (User-Centric)
  const totalProjects = projects.length;
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = userTasks.filter((t) => t.status === "IN PROGRESS").length;
  const todoTasks = userTasks.filter((t) => t.status === "TODO").length;

  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue tasks assigned to the user
  const now = new Date();
  const overdueTasksCount = userTasks.filter(
    (t) => t.status !== "COMPLETED" && t.endDate && new Date(t.endDate) < now
  ).length;

  // Calculate unique members across all projects
  const uniqueMemberIds = new Set();
  projects.forEach((proj) => {
    if (proj.admins) proj.admins.forEach((id) => uniqueMemberIds.add(id.toString()));
    if (proj.projectManagers) proj.projectManagers.forEach((id) => uniqueMemberIds.add(id.toString()));
    if (proj.members) proj.members.forEach((id) => uniqueMemberIds.add(id.toString()));
  });
  const totalMembersCount = uniqueMemberIds.size;

  // 2. Projects Breakdown (showing user tasks vs overall project progress)
  const projectsBreakdown = projects.map((proj) => {
    const projAllTasks = allTasks.filter((t) => t.projectId.toString() === proj._id.toString());
    const projUserTasks = userTasks.filter((t) => t.projectId.toString() === proj._id.toString());

    // User progress in this project
    const userProjTotal = projUserTasks.length;
    const userProjCompleted = projUserTasks.filter((t) => t.status === "COMPLETED").length;
    const userProjRate = userProjTotal > 0 ? Math.round((userProjCompleted / userProjTotal) * 100) : 0;

    // Overall project progress
    const projOverallTotal = projAllTasks.length;
    const projOverallCompleted = projAllTasks.filter((t) => t.status === "COMPLETED").length;
    const projOverallRate = projOverallTotal > 0 ? Math.round((projOverallCompleted / projOverallTotal) * 100) : 0;

    return {
      projectId: proj._id,
      projectName: proj.projectName,
      totalTasks: userProjTotal,
      completedTasks: userProjCompleted,
      completionRate: userProjRate, // User's progress rate
      overallCompletionRate: projOverallRate, // Overall project rate
      memberCount: (proj.admins?.length || 0) + (proj.projectManagers?.length || 0) + (proj.members?.length || 0),
    };
  });

  // 3. Task Status Distribution (User-Centric)
  const taskStatusDistribution = [
    { name: "TODO", value: todoTasks },
    { name: "IN PROGRESS", value: inProgressTasks },
    { name: "COMPLETED", value: completedTasks },
  ];

  // 4. Task Priority Distribution (User-Centric)
  const highPriority = userTasks.filter((t) => t.priority === "HIGH").length;
  const mediumPriority = userTasks.filter((t) => t.priority === "MEDIUM").length;
  const lowPriority = userTasks.filter((t) => t.priority === "LOW" || t.priority === "Low").length;

  const taskPriorityDistribution = [
    { name: "HIGH", count: highPriority },
    { name: "MEDIUM", count: mediumPriority },
    { name: "LOW", count: lowPriority },
  ];

  res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overallCompletionRate,
          totalMembersCount,
          overdueTasks: overdueTasksCount,
        },
        projectsBreakdown,
        taskStatusDistribution,
        taskPriorityDistribution,
      },
      "Global user analytics fetched successfully"
    )
  );
});

// Get analytics for a specific project based on user role
const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = req.project; // Populated by memberOfProject middleware
  const userIdStr = req.user._id.toString();
  const userEmail = req.user.email;

  if (!project) {
    throw new ApiError(404, "", "Project not found");
  }

  // Determine user's role
  let role = "MEMBER";
  if (project.admins && project.admins.some((id) => id.toString() === userIdStr)) {
    role = "ADMIN";
  } else if (project.projectManagers && project.projectManagers.some((id) => id.toString() === userIdStr)) {
    role = "PROJECT_MANAGER";
  }

  // Get all tasks and subtasks for this project
  const tasks = await Task.find({ projectId });
  const subtasks = await SubTask.find({ projectId });

  // 1. Calculate Personal Metrics (always computed for user)
  const personalTasks = tasks.filter((t) =>
    t.assigned && t.assigned.some((assignee) => assignee.email === userEmail)
  );
  const personalTotal = personalTasks.length;
  const personalCompleted = personalTasks.filter((t) => t.status === "COMPLETED").length;
  const personalInProgress = personalTasks.filter((t) => t.status === "IN PROGRESS").length;
  const personalTodo = personalTasks.filter((t) => t.status === "TODO").length;
  const personalCompletionRate = personalTotal > 0 ? Math.round((personalCompleted / personalTotal) * 100) : 0;

  const now = new Date();
  const personalOverdue = personalTasks.filter(
    (t) => t.status !== "COMPLETED" && t.endDate && new Date(t.endDate) < now
  ).length;

  const personalStatusDistribution = [
    { name: "TODO", value: personalTodo },
    { name: "IN PROGRESS", value: personalInProgress },
    { name: "COMPLETED", value: personalCompleted },
  ];

  const personalHighPriority = personalTasks.filter((t) => t.priority === "HIGH").length;
  const personalMediumPriority = personalTasks.filter((t) => t.priority === "MEDIUM").length;
  const personalLowPriority = personalTasks.filter((t) => t.priority === "LOW" || t.priority === "Low").length;

  const personalPriorityDistribution = [
    { name: "HIGH", count: personalHighPriority },
    { name: "MEDIUM", count: personalMediumPriority },
    { name: "LOW", count: personalLowPriority },
  ];

  // 2. Calculate Team Metrics (only returned/used for admins and managers)
  const teamTotalTasks = tasks.length;
  const teamCompletedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const teamInProgressTasks = tasks.filter((t) => t.status === "IN PROGRESS").length;
  const teamTodoTasks = tasks.filter((t) => t.status === "TODO").length;
  const teamTaskCompletionRate = teamTotalTasks > 0 ? Math.round((teamCompletedTasks / teamTotalTasks) * 100) : 0;

  const teamTotalSubtasks = subtasks.length;
  const teamCompletedSubtasks = subtasks.filter((st) => st.status === "COMPLETED").length;
  const teamSubtaskCompletionRate = teamTotalSubtasks > 0 ? Math.round((teamCompletedSubtasks / teamTotalSubtasks) * 100) : 0;

  const teamOverdue = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.endDate && new Date(t.endDate) < now
  ).length;

  const teamStatusDistribution = [
    { name: "TODO", value: teamTodoTasks },
    { name: "IN PROGRESS", value: teamInProgressTasks },
    { name: "COMPLETED", value: teamCompletedTasks },
  ];

  const teamHighPriority = tasks.filter((t) => t.priority === "HIGH").length;
  const teamMediumPriority = tasks.filter((t) => t.priority === "MEDIUM").length;
  const teamLowPriority = tasks.filter((t) => t.priority === "LOW" || t.priority === "Low").length;

  const teamPriorityDistribution = [
    { name: "HIGH", count: teamHighPriority },
    { name: "MEDIUM", count: teamMediumPriority },
    { name: "LOW", count: teamLowPriority },
  ];

  // Calculate workloads
  const teamMembersSet = new Set();
  if (project.admins) project.admins.forEach(id => teamMembersSet.add(id.toString()));
  if (project.projectManagers) project.projectManagers.forEach(id => teamMembersSet.add(id.toString()));
  if (project.members) project.members.forEach(id => teamMembersSet.add(id.toString()));

  const workloadMap = {};
  const users = await User.find({ _id: { $in: Array.from(teamMembersSet).map(id => new mongoose.Types.ObjectId(id)) } });
  users.forEach(u => {
    workloadMap[u.email] = 0;
  });

  tasks.forEach(t => {
    if (t.assigned) {
      t.assigned.forEach(assignee => {
        if (assignee.email) {
          workloadMap[assignee.email] = (workloadMap[assignee.email] || 0) + 1;
        }
      });
    }
  });

  const memberWorkload = Object.keys(workloadMap).map(email => ({
    email,
    taskCount: workloadMap[email],
  }));

  // Construct response
  const responseData = {
    projectId: project._id,
    projectName: project.projectName,
    role,
    personal: {
      summary: {
        totalTasks: personalTotal,
        completedTasks: personalCompleted,
        completionRate: personalCompletionRate,
        overdueTasks: personalOverdue,
      },
      taskStatusDistribution: personalStatusDistribution,
      taskPriorityDistribution: personalPriorityDistribution,
    },
  };

  // Only append team analytics if user is ADMIN or PROJECT_MANAGER
  if (role === "ADMIN" || role === "PROJECT_MANAGER") {
    responseData.team = {
      summary: {
        totalTasks: teamTotalTasks,
        completedTasks: teamCompletedTasks,
        completionRate: teamTaskCompletionRate,
        totalSubtasks: teamTotalSubtasks,
        completedSubtasks: teamCompletedSubtasks,
        subtaskCompletionRate: teamSubtaskCompletionRate,
        totalMembers: teamMembersSet.size,
        overdueTasks: teamOverdue,
      },
      taskStatusDistribution: teamStatusDistribution,
      taskPriorityDistribution: teamPriorityDistribution,
      memberWorkload,
    };
  } else {
    // If regular MEMBER, just give overall progress percent for the progress bar context
    responseData.projectOverallProgress = teamTaskCompletionRate;
  }

  res.status(200).json(
    new ApiResponse(200, responseData, "Project analytics fetched successfully")
  );
});

export { getGlobalAnalytics, getProjectAnalytics };
