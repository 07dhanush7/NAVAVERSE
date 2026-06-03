import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    phoneNumber: {
      type: String,
      default: "",
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
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

eventRegistrationSchema.pre("validate", function syncLegacyUserFields() {
  if (!this.userId && this.applicantId) {
    this.userId = this.applicantId;
  }

  if (!this.applicantId && this.userId) {
    this.applicantId = this.userId;
  }

  if (!this.userName && this.applicantName) {
    this.userName = this.applicantName;
  }

  if (!this.applicantName && this.userName) {
    this.applicantName = this.userName;
  }

  if (!this.phoneNumber && this.phone) {
    this.phoneNumber = this.phone;
  }

  if (!this.phone && this.phoneNumber) {
    this.phone = this.phoneNumber;
  }
});

eventRegistrationSchema.index({ eventId: 1, userId: 1 });
eventRegistrationSchema.index({ receiverId: 1, createdAt: -1 });

export default mongoose.model("EventRegistration", eventRegistrationSchema);
