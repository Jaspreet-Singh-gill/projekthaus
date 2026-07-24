import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Comment } from "../models/comment.model.js";
import { Project } from "../models/project.model.js";
import { io } from "../index.js";

const addComment = asyncHandler(async (req, res) => {
  const { projectId, taskId, subtaskId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "", "Comment content is required");
  }

  if (!taskId && !subtaskId) {
    throw new ApiError(400, "", "Either taskId or subtaskId must be provided in the URL");
  }

  const comment = await Comment.create({
    content,
    author: req.user._id,
    projectId,
    taskId: taskId || undefined,
    subtaskId: subtaskId || undefined,
  });  
  await comment.populate("author", "name username email avatar");
  io.to(projectId.toString()).emit("new_comment", comment);
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const getComments = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  if (!taskId && !subtaskId) {
    throw new ApiError(400, "", "Either taskId or subtaskId must be provided in the URL");
  }

  const query = {};
  if (taskId) query.taskId = taskId;
  if (subtaskId) query.subtaskId = subtaskId;

  const comments = await Comment.find(query)
    .populate("author", "name username email avatar")
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "", "Comment not found");
  }

  const isAuthor = comment.author.toString() === req.user._id.toString();

  let isAdmin = false;
  if (req.project) {
    isAdmin = req.project.admins.some(
      (adminId) => adminId.toString() === req.user._id.toString()
    );
  }

  if (!isAuthor && !isAdmin) {
    throw new ApiError(403, "", "You do not have permission to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  io.to(comment.projectId.toString()).emit("comment_deleted", commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { addComment, getComments, deleteComment };
