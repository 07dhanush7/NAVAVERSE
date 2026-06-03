import Blog from "../models/Blog.js";
import Course from "../models/Course.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";
import Startup from "../models/Startup.js";

const contentDefinitions = [
  {
    key: "blogs",
    label: "Blog",
    loadItems: async (userId) => {
      const items = await Blog.find({ creator: userId })
        .select("title status rejectionReason createdAt category isPublished")
        .sort({ createdAt: -1 })
        .lean();

      return items.map((item) => ({
        ...item,
        status: item.status || (item.isPublished ? "approved" : "pending"),
        type: "Blog",
      }));
    },
  },
  { key: "jobs", label: "Job", Model: Job },
  { key: "events", label: "Event", Model: Event },
  { key: "courses", label: "Course", Model: Course },
  { key: "startups", label: "Startup", Model: Startup },
];

export const getUserDashboardContent = async (req, res) => {
  try {
    const results = await Promise.all(
      contentDefinitions.map(async ({ key, label, Model, loadItems }) => {
        if (loadItems) {
          return [key, await loadItems(req.user._id)];
        }

        const items = await Model.find({
          $or: [{ createdBy: req.user._id }, { createdBy: req.user._id.toString() }],
        })
          .select("title status rejectionReason createdAt category")
          .sort({ createdAt: -1 })
          .lean();

        return [
          key,
          items.map((item) => ({
            ...item,
            type: label,
          })),
        ];
      })
    );

    return res.status(200).json({
      success: true,
      ...Object.fromEntries(results),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};
