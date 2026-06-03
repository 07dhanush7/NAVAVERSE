import mongoose from "mongoose";

const startupDiscussionSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StartupDiscussion", startupDiscussionSchema);
