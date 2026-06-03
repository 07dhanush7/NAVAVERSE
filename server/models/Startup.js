import mongoose from "mongoose";

const startupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      default: "",
      trim: true,
    },
    solution: {
      type: String,
      default: "",
      trim: true,
    },
    vision: {
      type: String,
      default: "",
      trim: true,
    },
    stage: {
      type: String,
      enum: ["Idea", "MVP", "Funded"],
      required: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    founderName: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
    startupImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    creatorType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    creatorName: {
      type: String,
      default: "",
      trim: true,
    },
    creatorEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
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
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  { timestamps: true }
);

startupSchema.index({ status: 1, createdAt: -1 });
startupSchema.index({ stage: 1, status: 1 });

export default mongoose.model("Startup", startupSchema);
