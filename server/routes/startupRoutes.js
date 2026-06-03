import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import protect, { tryProtect } from "../middleware/auth.js";
import allowAdminOrUser from "../middleware/allowAdminOrUser.js";
import { uploadContentImage } from "../middleware/uploadMiddleware.js";
import {
  approveStartup,
  collaborateOnStartup,
  createStartup,
  createStartupDiscussion,
  deleteStartup,
  getAdminCollaborationRequests,
  getAdminStartups,
  getAppliedCollaborations,
  getPendingStartups,
  getPublicStartupById,
  getPublicStartups,
  getStartupDiscussions,
  getUserCollaborationRequests,
  getUserStartups,
  rateStartup,
  rejectStartup,
  toggleStartupLike,
  toggleStartupSave,
  updateCollaborationStatus,
  updateStartup,
} from "../controllers/startupController.js";

const router = express.Router();

router.get("/public", tryProtect, getPublicStartups);
router.get("/public/:id/discussions", getStartupDiscussions);
router.get("/public/:id", tryProtect, getPublicStartupById);

router.get("/user/my-content", protect, getUserStartups);
router.get("/user/collaboration-requests", protect, getUserCollaborationRequests);
router.get("/user/collaborations/applied", protect, getAppliedCollaborations);
router.post("/create", allowAdminOrUser, uploadContentImage.single("image"), createStartup);
router.put("/user/update/:id", allowAdminOrUser, uploadContentImage.single("image"), updateStartup);
router.delete("/user/delete/:id", allowAdminOrUser, deleteStartup);
router.post("/:id/discussions", protect, createStartupDiscussion);
router.post("/:id/comments", protect, createStartupDiscussion);
router.post("/:id/collaborate", protect, collaborateOnStartup);
router.post("/:id/like", protect, toggleStartupLike);
router.post("/:id/save", protect, toggleStartupSave);
router.post("/:id/rate", protect, rateStartup);
router.put("/collaborations/:requestId/status", allowAdminOrUser, updateCollaborationStatus);

router.get("/admin/all", adminAuth, getAdminStartups);
router.get("/admin/pending", adminAuth, getPendingStartups);
router.get("/admin/collaboration-requests", adminAuth, getAdminCollaborationRequests);
router.post("/admin/create", adminAuth, uploadContentImage.single("image"), createStartup);
router.put("/admin/collaborations/:requestId/status", adminAuth, updateCollaborationStatus);
router.put("/admin/approve/:id", adminAuth, approveStartup);
router.put("/admin/reject/:id", adminAuth, rejectStartup);

export default router;
