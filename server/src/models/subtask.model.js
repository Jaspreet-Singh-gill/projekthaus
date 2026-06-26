import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
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
    taskId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Task",
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
      enum: ["HIGH", "MEDIUM", "LOW"],
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
    assigned: [
      {
        id: {
          type: Schema.Types.ObjectId,
        },
        email: {
          type: String,
        },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const SubTask = mongoose.model("subTasks", schema);
export { SubTask };
