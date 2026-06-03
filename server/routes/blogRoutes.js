import express from "express";
import multer from "multer";
import adminAuth from "../middleware/adminAuth.js";
import protect, { tryProtect } from "../middleware/auth.js";

import {
  createBlog,
  createUserBlog,
  generateBlog,
  getAllBlogs,
  getAdminBlogs,
  getSingleBlog,
  togglePublish,
  toggleLike,
  rateBlog,
  toggleFeatured,
  toggleUpcoming,
  getFeaturedBlogs,
  getUpcomingBlogs,
  getPendingBlogs,
  updateBlogByAdmin
} from "../controllers/blogController.js";

const router = express.Router();

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ================= PUBLIC ROUTES ================= */

// get all published blogs
router.get("/", getAllBlogs);

// featured blogs
router.get("/featured", getFeaturedBlogs);

// upcoming blogs
router.get("/upcoming", getUpcomingBlogs);

/* ================= ADMIN ROUTES ================= */

// get all blogs (admin panel)
router.get("/admin/all", adminAuth, getAdminBlogs);

// get pending user blogs
router.get("/admin/pending", adminAuth, getPendingBlogs);

// admin create blog
router.post(
  "/add",
  adminAuth,
  upload.single("image"),
  createBlog
);

// approve / edit user blog
router.put(
  "/admin/update/:id",
  adminAuth,
  upload.single("image"),
  updateBlogByAdmin
);

// publish / unpublish
router.put("/toggle/:id", adminAuth, togglePublish);

// toggle featured
router.put("/featured/:id", adminAuth, toggleFeatured);

// toggle upcoming
router.put("/upcoming/:id", adminAuth, toggleUpcoming);

/* ================= USER ROUTES ================= */

// AI blog generation
router.post("/generate", protect, generateBlog);

// user create blog
router.post(
  "/create",
  protect,
  upload.single("image"),
  createUserBlog
);

// like blog
router.put("/like/:id", protect, toggleLike);

// rate blog
router.put("/rate/:id", protect, rateBlog);

/* ================= SINGLE BLOG (LAST) ================= */

router.get("/:id", tryProtect, getSingleBlog);

export default router;
