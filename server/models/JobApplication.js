import mongoose from "mongoose";

const APPLICATION_STATUSES = ["Pending", "Shortlisted", "Approved", "Rejected"];

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      alias: "userId",
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    receiverId: {
      type: String,
      required: true,
      trim: true,
    },
    resume: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Pending",
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
jobApplicationSchema.index({ receiverId: 1, createdAt: -1 });

export { APPLICATION_STATUSES };
export default mongoose.model("JobApplication", jobApplicationSchema);
