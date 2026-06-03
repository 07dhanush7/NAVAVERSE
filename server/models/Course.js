import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    creatorRole: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    isAdminPost: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ createdBy: 1, creatorRole: 1, createdAt: -1 });

export default mongoose.model("Course", courseSchema);
