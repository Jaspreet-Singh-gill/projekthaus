import { asyncHandler } from "../utils/aysncHandler.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/api-response.js";
import { Notification } from "../models/notification.model.js";

const getUserNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const notifications = await Notification.find({
    recipient: userId,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name email"); // Assumed basic fields, you can adjust

  res.status(200).json(
    new ApiResponse(200, notifications, "Notifications fetched successfully")
  );
});

const markAsRead = asyncHandler(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  if (!notificationId) {
    throw new ApiError(400, "", "Notification ID is required");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "", "Notification not found or unauthorized");
  }

  res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

export { getUserNotifications, markAsRead };
