import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Event", eventSchema);
