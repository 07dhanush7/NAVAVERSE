import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import protect from "../middleware/auth.js";
import { uploadCompanyLogo, uploadResume } from "../middleware/uploadMiddleware.js";
import {
  approveJob,
  applyForJob,
  createJob,
  deleteJob,
  getAdminJobs,
  getApplicantsByJob,
  getPendingJobs,
  getPublicJobById,
  getPublicJobs,
  getUserJobs,
  rejectJob,
  updateApplicantStatus,
  updateJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getPublicJobs);
router.get("/my", protect, getUserJobs);
router.get("/public", getPublicJobs);
router.get("/public/:id", getPublicJobById);
router.get("/user/my-content", protect, getUserJobs);
router.post("/create", protect, uploadCompanyLogo.single("companyLogo"), createJob);
router.put("/user/update/:id", protect, uploadCompanyLogo.single("companyLogo"), updateJob);
router.delete("/user/delete/:id", protect, deleteJob);
router.post("/apply/:id", protect, uploadResume.single("resume"), applyForJob);
router.post("/admin/create", adminAuth, uploadCompanyLogo.single("companyLogo"), createJob);
router.get("/admin/all", adminAuth, getAdminJobs);
router.get("/admin/pending", adminAuth, getPendingJobs);
router.put("/admin/approve/:id", adminAuth, approveJob);
router.put("/admin/reject/:id", adminAuth, rejectJob);
router.delete("/admin/delete/:id", adminAuth, deleteJob);
router.get("/admin/applicants/:jobId", adminAuth, getApplicantsByJob);
router.patch("/admin/application-status/:applicationId", adminAuth, updateApplicantStatus);
router.get("/:id", getPublicJobById);

export default router;
