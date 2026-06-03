import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import protect from "../middleware/auth.js";
import {
  getAdminRegistrations,
  getRegistrationsForMyEvents,
  registerForEvent,
  updateRegistrationStatus,
} from "../controllers/registrationController.js";

const router = express.Router();

router.post("/register/:id", protect, registerForEvent);
router.get("/my-events", protect, getRegistrationsForMyEvents);
router.get("/admin", adminAuth, getAdminRegistrations);
router.patch("/admin/:registrationId/status", adminAuth, updateRegistrationStatus);
router.patch("/:registrationId/status", protect, updateRegistrationStatus);

export default router;
