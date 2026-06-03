import mongoose from "mongoose";

const startupCollaborationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
      trim: true,
    },
    ownerType: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["Developer", "Designer", "Marketer", "Investor"],
      required: true,
    },
    skills: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

startupCollaborationSchema.index({ applicantId: 1, startupId: 1 }, { unique: true });
startupCollaborationSchema.index({ ownerId: 1, ownerType: 1, status: 1 });

export default mongoose.model("StartupCollaboration", startupCollaborationSchema);
