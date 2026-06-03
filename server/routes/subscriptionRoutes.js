import express from "express";
import {
  subscribe,
  getAllSubscriptions,
  getNotifications,
  markNotificationRead,
} from "../controllers/subscriptionController.js";
import protectAdmin from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */
router.post("/subscribe", subscribe);

/* ================= ADMIN ROUTES ================= */
router.get("/all", protectAdmin, getAllSubscriptions);
router.get("/notifications", protectAdmin, getNotifications);
router.put("/notification/read/:id", protectAdmin, markNotificationRead);

export default router;