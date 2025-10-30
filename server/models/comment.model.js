import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audio",
      default: null,
    },
  },
  { timestamps: true }
);

const Comment= mongoose.model("Comment", commentSchema);

export default Comment;