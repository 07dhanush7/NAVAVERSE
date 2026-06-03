import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      default: "",
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
      select: false,
    },
    savedStartups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Startup",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
