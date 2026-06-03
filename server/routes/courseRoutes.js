import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import protect from "../middleware/auth.js";
import allowAdminOrUser from "../middleware/allowAdminOrUser.js";
import { uploadContentImage } from "../middleware/uploadMiddleware.js";
import {
  approveCourse,
  createCourseComment,
  createCourse,
  deleteCourse,
  enrollInCourse,
  getAdminCourses,
  getCourseComments,
  getPendingCourses,
  getPublicCourseById,
  getPublicCourses,
  getUserCourses,
  rejectCourse,
  updateCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/public", getPublicCourses);
router.get("/public/:id", getPublicCourseById);
router.get("/:id/comments", getCourseComments);
router.post("/:id/comments", protect, createCourseComment);
router.get("/user/my-content", protect, getUserCourses);
router.post("/create", allowAdminOrUser, uploadContentImage.single("image"), createCourse);
router.post("/admin/create", adminAuth, uploadContentImage.single("image"), createCourse);
router.delete("/admin/delete/:id", adminAuth, deleteCourse);
router.put("/user/update/:id", allowAdminOrUser, uploadContentImage.single("image"), updateCourse);
router.delete("/user/delete/:id", allowAdminOrUser, deleteCourse);
router.post("/enroll/:id", protect, enrollInCourse);
router.get("/admin/all", adminAuth, getAdminCourses);
router.get("/admin/pending", adminAuth, getPendingCourses);
router.put("/admin/approve/:id", adminAuth, approveCourse);
router.put("/admin/reject/:id", adminAuth, rejectCourse);

export default router;
