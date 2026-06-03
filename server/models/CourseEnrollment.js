import mongoose from "mongoose";

const courseEnrollmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

courseEnrollmentSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export default mongoose.model("CourseEnrollment", courseEnrollmentSchema);
