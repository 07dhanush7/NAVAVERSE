import express from "express";
import multer from "multer";

import {
  registerUser,
  loginUser,
  googleAuth,
  getAuthConfig,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfile,
  getUserPublicProfile,
} from "../controllers/userController.js";

import protect from "../middleware/auth.js";

const router = express.Router();

/* Multer setup */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* Routes */
router.get("/auth-config", getAuthConfig);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getMyProfile);
router.get("/public/:id", getUserPublicProfile);
router.put("/profile", protect, upload.single("profileImage"), updateProfile);

export default router;
