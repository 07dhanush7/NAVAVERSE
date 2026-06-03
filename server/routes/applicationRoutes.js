import express from "express";
import protect from "../middleware/auth.js";
import { getApplicationsForMyJobs, updateApplicantStatus } from "../controllers/jobController.js";

const router = express.Router();

router.get("/my-jobs", protect, getApplicationsForMyJobs);
router.patch("/my-jobs/:applicationId/status", protect, updateApplicantStatus);

export default router;
