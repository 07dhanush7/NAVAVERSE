import mongoose from "mongoose";

const createModeratedContentModel = (modelName, extraFields = {}) => {
  const schema = new mongoose.Schema(
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
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
      ...extraFields,
    },
    { timestamps: true }
  );

  return mongoose.model(modelName, schema);
};

export default createModeratedContentModel;
