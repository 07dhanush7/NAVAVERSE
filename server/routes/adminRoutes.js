import express from "express";
import protectAdmin from "../middleware/adminAuth.js";

import {
  adminLogin,
  getDashboardData,
  getAdminBlogById,
  getAdminBlogs,
  deleteBlog,
  getAdminComments,
  approveComment,
  deleteComment,
  getPerformanceStats,
  getCategoryAnalytics,
  getCalendarData,
} from "../controllers/adminController.js";
import {
  approveJob,
  getPendingJobs,
  rejectJob,
} from "../controllers/jobController.js";

import { generateBlog } from "../controllers/blogController.js"; // ✅ separate import

const router = express.Router();

router.post("/login", adminLogin);

router.get("/dashboard", protectAdmin, getDashboardData);

router.post("/generate", protectAdmin, generateBlog); // ✅ correct route

router.get("/blogs", protectAdmin, getAdminBlogs);
router.get("/blog/:id", protectAdmin, getAdminBlogById);
router.delete("/blog/:id", protectAdmin, deleteBlog);

router.get("/comments", protectAdmin, getAdminComments);
router.put("/approve/:id", protectAdmin, approveComment);
router.delete("/comment/:id", protectAdmin, deleteComment);

router.get("/performance", protectAdmin, getPerformanceStats);
router.get("/categories", protectAdmin, getCategoryAnalytics);
router.get("/calendar", protectAdmin, getCalendarData);
router.get("/jobs/pending", protectAdmin, getPendingJobs);
router.put("/jobs/approve/:id", protectAdmin, approveJob);
router.put("/jobs/reject/:id", protectAdmin, rejectJob);

export default router;
