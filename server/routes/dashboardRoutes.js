import express from "express";
import protect from "../middleware/auth.js";
import { getUserDashboardContent } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/user", protect, getUserDashboardContent);

export default router;
