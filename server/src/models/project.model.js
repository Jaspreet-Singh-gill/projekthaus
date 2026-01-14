import mongoose, { Schema } from "mongoose";

const projectScheme = Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      trim: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    projectManagers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model("project", projectScheme);

export { Project };
