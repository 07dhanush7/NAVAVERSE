import express from "express";
import { createComment, getComments } from "../controllers/commentController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/:blogId", getComments);
router.post("/:blogId", protect, createComment);

export default router;