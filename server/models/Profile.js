import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);