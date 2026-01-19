import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  taskId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const taskFile = new mongoose.model("taskFile", schema);

export { taskFile };
