import express from "express";
import multer from "multer";
import userAuth from "../middleware/userAuth.js";
import { getMyProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/me", userAuth, getMyProfile);
router.put("/me", userAuth, upload.single("profileImage"), updateProfile);

export default router;