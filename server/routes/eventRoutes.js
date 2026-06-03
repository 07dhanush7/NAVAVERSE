import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import protect from "../middleware/auth.js";
import allowAdminOrUser from "../middleware/allowAdminOrUser.js";
import { uploadContentImage } from "../middleware/uploadMiddleware.js";
import {
  approveEvent,
  createEvent,
  deleteEvent,
  getAdminEvents,
  getPendingEvents,
  getPublicEventById,
  getPublicEvents,
  getUserEvents,
  rejectEvent,
  updateEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/public", getPublicEvents);
router.get("/public/:id", getPublicEventById);
router.get("/user/my-content", protect, getUserEvents);
router.post("/create", protect, uploadContentImage.single("image"), createEvent);
router.post("/admin/create", adminAuth, uploadContentImage.single("image"), createEvent);
router.put("/user/update/:id", allowAdminOrUser, uploadContentImage.single("image"), updateEvent);
router.delete("/user/delete/:id", allowAdminOrUser, deleteEvent);
router.get("/admin/all", adminAuth, getAdminEvents);
router.delete("/admin/delete/:id", adminAuth, deleteEvent);
router.get("/admin/pending", adminAuth, getPendingEvents);
router.put("/admin/approve/:id", adminAuth, approveEvent);
router.put("/admin/reject/:id", adminAuth, rejectEvent);
router.get("/:id", getPublicEventById);

export default router;
