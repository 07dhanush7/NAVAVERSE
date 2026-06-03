import mongoose from "mongoose";

const JOB_CATEGORIES = [
  "KAS",
  "Central Govt",
  "Private IT",
  "Private Non-IT",
  "Internship",
  "Karnataka Administrative Service",
  "Central Civil Services",
];

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship"];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      alias: "company",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      default: "",
      trim: true,
    },
    experience: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skillsRequired: {
      type: [String],
      default: [],
      alias: "skills",
    },
    category: {
      type: String,
      enum: JOB_CATEGORIES,
      required: true,
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      required: true,
    },
    postedBy: {
      type: String,
      required: true,
      default: "admin-id",
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
      default: "approved",
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
      default: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({
  title: "text",
  companyName: "text",
  description: "text",
  location: "text",
});

export { JOB_CATEGORIES, JOB_TYPES };
export default mongoose.model("Job", jobSchema);
