import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Project",
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000,
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Low",
  },
  status: {
    type: String,
    enum: ["TODO", "IN PROGRESS", "COMPLETED"],
    default: "TODO",
  },
  progress: {
    type: Number,
    min: [0, "Progress cannot be less than 0"],
    max: [100, "Progress cannot be greater then 100"],
    default: 0,
  },
});

const Task = mongoose.model("tasks", schema);
export { Task };
