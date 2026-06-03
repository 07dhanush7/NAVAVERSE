import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    subTitle: String,

    description: {
      type: String,
      required: true,
    },

    image: String,

    category: String,

    // Explicit display author for admin-authored posts.
    authorName: {
      type: String,
      default: "",
      trim: true,
    },

    // User-submitted blogs keep a real user reference here.
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isUpcoming: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    viewedBy: [
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

blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ creator: 1, createdAt: -1 });

export default mongoose.model("Blog", blogSchema);
