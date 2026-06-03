import mongoose from "mongoose";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";

const buildFilePath = (file) => (file ? `/uploads/${file.filename}` : "");

const parseSkills = (value) => {
  if (Array.isArray(value)) {
    return value.map((skill) => skill.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const getJobPayload = (body) => ({
  title: body.title,
  companyName: body.companyName ?? body.company,
  location: body.location,
  salary: body.salary,
  experience: body.experience,
  description: body.description,
  category: body.category,
  jobType: body.jobType,
  skillsRequired: body.skillsRequired ?? body.skills,
});

const getCategoryFilter = (category) => {
  if (category === "KAS") {
    return { $in: ["KAS", "Karnataka Administrative Service"] };
  }

  if (category === "Central Govt") {
    return { $in: ["Central Govt", "Central Civil Services"] };
  }

  return category;
};

const getActorIdentity = (req) => {
  if (req.admin?.id) {
    return {
      id: req.admin.id.toString(),
      role: "admin",
    };
  }

  if (req.user?._id) {
    return {
      id: req.user._id.toString(),
      role: "user",
    };
  }

  return null;
};

const getCreatorDetails = async (job) => {
  if (!job?.createdBy) {
    return {
      createdBy: "",
      creatorRole: job?.creatorRole || "user",
      creatorName: "Unknown",
      creatorEmail: "",
    };
  }

  if (job.creatorRole === "admin") {
    return {
      createdBy: job.createdBy,
      creatorRole: "admin",
      creatorName: "Admin",
      creatorEmail: process.env.ADMIN_EMAIL || "",
    };
  }

  const owner = await User.findById(job.createdBy).select("username email");

  return {
    createdBy: job.createdBy,
    creatorRole: "user",
    creatorName: owner?.username || owner?.email || "Unknown User",
    creatorEmail: owner?.email || "",
  };
};

const isOwnerOrAdmin = (job, req) => {
  if (req.admin) {
    return true;
  }

  if (!req.user?._id || !job.createdBy) {
    return false;
  }

  return job.createdBy === req.user._id.toString();
};

const canManageApplicationForJob = (job, req) => {
  if (!job?.createdBy) {
    return false;
  }

  if (req.admin) {
    return job.creatorRole === "admin" && job.createdBy === req.admin.id;
  }

  if (req.user?._id) {
    return job.creatorRole === "user" && job.createdBy === req.user._id.toString();
  }

  return false;
};

export const getPublicJobs = async (req, res) => {
  try {
    const { category, location, jobType, search, limit } = req.query;
    const filters = { status: "approved" };

    if (category && category !== "All") {
      filters.category = getCategoryFilter(category);
    }

    if (location) {
      filters.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      filters.jobType = jobType;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { skillsRequired: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const query = Job.find(filters).sort({ createdAt: -1 });

    if (limit) {
      query.limit(Number(limit));
    }

    const items = await query;

    return res.status(200).json({
      success: true,
      items,
      jobs: items,
    });
  } catch (error) {
    console.error("Get Public Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

export const getPublicJobById = async (req, res) => {
  try {
    const item = await Job.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      item,
      job: item,
    });
  } catch (error) {
    console.error("Get Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
    });
  }
};

export const getUserJobs = async (req, res) => {
  try {
    const items = await Job.find({ createdBy: req.user._id.toString() }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
      jobs: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your jobs",
    });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    const items = await Promise.all(
      jobs.map(async (job) => ({
        ...job,
        ...(await getCreatorDetails(job)),
      }))
    );

    return res.status(200).json({
      success: true,
      items,
      jobs: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
    const items = await Promise.all(
      jobs.map(async (job) => ({
        ...job,
        ...(await getCreatorDetails(job)),
      }))
    );

    return res.status(200).json({
      success: true,
      items,
      jobs: items,
    });
  } catch (error) {
    console.error("Get Pending Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending jobs",
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      location,
      salary,
      experience,
      description,
      category,
      jobType,
      skillsRequired,
    } = getJobPayload(req.body);

    const actor = getActorIdentity(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create this job",
      });
    }

    const isAdminPost = actor.role === "admin";

    const item = await Job.create({
      title,
      companyName,
      companyLogo: buildFilePath(req.file),
      location,
      salary,
      experience,
      description,
      category,
      jobType,
      skillsRequired: parseSkills(skillsRequired),
      postedBy: actor.id,
      createdBy: actor.id,
      creatorRole: actor.role,
      status: isAdminPost ? "approved" : "pending",
      reviewedBy: isAdminPost ? actor.id : null,
      rejectionReason: "",
      isAdminPost,
    });

    return res.status(201).json({
      success: true,
      message: isAdminPost
        ? "Job created successfully"
        : "Your job has been submitted and is waiting for admin approval.",
      item,
      job: item,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const item = await Job.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!isOwnerOrAdmin(item, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    const {
      title,
      companyName,
      location,
      salary,
      experience,
      description,
      category,
      jobType,
      skillsRequired,
    } = getJobPayload(req.body);

    item.title = title ?? item.title;
    item.companyName = companyName ?? item.companyName;
    item.location = location ?? item.location;
    item.salary = salary ?? item.salary;
    item.experience = experience ?? item.experience;
    item.description = description ?? item.description;
    item.category = category ?? item.category;
    item.jobType = jobType ?? item.jobType;

    if (skillsRequired !== undefined) {
      item.skillsRequired = parseSkills(skillsRequired);
    }

    if (req.file) {
      item.companyLogo = buildFilePath(req.file);
    }

    if (req.admin) {
      item.createdBy = req.admin.id;
      item.creatorRole = "admin";
      item.status = "approved";
      item.reviewedBy = req.admin.id;
      item.rejectionReason = "";
      item.isAdminPost = true;
    } else {
      item.createdBy = req.user._id.toString();
      item.creatorRole = "user";
      item.status = "pending";
      item.reviewedBy = null;
      item.rejectionReason = "";
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      item,
      job: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const item = await Job.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!isOwnerOrAdmin(item, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(req.params.id);
    await JobApplication.deleteMany({ jobId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

export const approveJob = async (req, res) => {
  try {
    const item = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        reviewedBy: req.admin.id,
        rejectionReason: "",
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job approved successfully",
      item,
      job: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve job",
    });
  }
};

export const rejectJob = async (req, res) => {
  try {
    const item = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        reviewedBy: req.admin.id,
        rejectionReason: req.body.rejectionReason || "",
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job rejected successfully",
      item,
      job: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject job",
    });
  }
};

export const applyForJob = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Please login to apply",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const job = await Job.findOne({ _id: id, status: "approved" }).select(
      "title createdBy creatorRole status"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!job.createdBy) {
      return res.status(400).json({
        success: false,
        message: "This job is missing an owner and cannot accept applications",
      });
    }

    if (job.createdBy === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own job",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume upload is required",
      });
    }

    const application = await JobApplication.create({
      jobId: id,
      jobTitle: job.title,
      applicantId: req.user._id,
      applicantName: req.user.username,
      email: req.user.email,
      phone: req.body.phone || "",
      receiverId: job.createdBy,
      resume: buildFilePath(req.file),
      coverLetter: req.body.coverLetter || "",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    const message =
      error.code === 11000 ? "You have already applied for this job" : "Failed to submit application";

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getApplicantsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId).select("title companyName createdBy creatorRole");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!canManageApplicationForJob(job, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications for this job",
      });
    }

    const applicants = await JobApplication.find({ jobId })
      .sort({ createdAt: -1 });

    const formattedApplicants = applicants.map((application) => ({
      _id: application._id,
      applicantName: application.applicantName || "Unknown User",
      email: application.email || "No email",
      phone: application.phone || "",
      resume: application.resume,
      coverLetter: application.coverLetter,
      status: application.status,
      applicationDate: application.createdAt,
    }));

    return res.status(200).json({
      success: true,
      job,
      applicants: formattedApplicants,
    });
  } catch (error) {
    console.error("Get Applicants Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
    });
  }
};

export const getApplicationsForMyJobs = async (req, res) => {
  try {
    const applications = await JobApplication.find({ receiverId: req.user._id.toString() })
      .populate("jobId", "title companyName location")
      .sort({ createdAt: -1 });

    const items = applications.map((application) => ({
      _id: application._id,
      applicantName: application.applicantName || "Unknown User",
      applicantEmail: application.email || "No email",
      phone: application.phone || "",
      resume: application.resume,
      details: application.coverLetter,
      appliedDate: application.createdAt,
      status: application.status,
      job: {
        _id: application.jobId?._id || null,
        title: application.jobId?.title || "Deleted Job",
        companyName: application.jobId?.companyName || "",
        location: application.jobId?.location || "",
      },
    }));

    return res.status(200).json({
      success: true,
      items,
      applications: items,
    });
  } catch (error) {
    console.error("Get Applications For My Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications for your jobs",
    });
  }
};

export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Shortlisted", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const applicationRecord = await JobApplication.findById(applicationId).populate(
      "jobId",
      "createdBy creatorRole"
    );

    if (!applicationRecord) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!canManageApplicationForJob(applicationRecord.jobId, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    )
      .populate("jobId", "title companyName");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: {
        _id: application._id,
        applicantName: application.applicantName || "Unknown User",
        email: application.email || "No email",
        phone: application.phone || "",
        resume: application.resume,
        coverLetter: application.coverLetter,
        status: application.status,
        applicationDate: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Applicant Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};
