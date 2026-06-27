import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    content: {
      type: String,
      required: true,
      default: "",
    },

    category: {
      type: String,
      enum: ["General", "Meeting", "Documentation", "Idea", "Research","Instructions"],
      default: "General",
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Notes = mongoose.model("Notes", schema);

export { Notes };
