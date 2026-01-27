import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    subTaskId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileKind: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const subTaskFile = new mongoose.model("subtaskFile", schema);

export { subTaskFile };
