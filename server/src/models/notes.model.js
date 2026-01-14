import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Notes = mongoose.model("Notes", schema);

export {Notes};
