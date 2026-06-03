import Startup from "../models/Startup.js";
import User from "../models/User.js";
import StartupDiscussion from "../models/StartupDiscussion.js";
import StartupCollaboration from "../models/StartupCollaboration.js";

const FALLBACK_IMAGE = "https://via.placeholder.com/1200x720?text=Navaverse+Startup";
const APPROVED_STATUSES = ["Approved", "approved"];
const PENDING_STATUSES = ["Pending", "pending"];
const getApiOrigin = () =>
  (process.env.API_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5000").replace(/\/$/, "");
const normalizeStatus = (status = "") =>
  status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "";

const buildImagePath = (file) => (file ? `/uploads/${file.filename}` : "");
const normalizeTags = (...values) =>
  [
    ...new Set(
      values.flatMap((value) =>
        String(value || "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      )
    ),
  ].slice(0, 6);

const getActor = (req) => {
  if (req.admin) {
    return {
      id: String(req.admin.id),
      type: "admin",
      name: req.admin.name || "NAVAVERSE Admin",
      email: req.admin.email || "",
    };
  }

  return {
    id: String(req.user._id),
    type: "user",
    name: req.user.username || "NAVAVERSE User",
    email: req.user.email || "",
  };
};

const isOwnerOrAdmin = (startup, req) => {
  if (req.admin) {
    return true;
  }

  return String(startup.createdBy) === String(req.user?._id);
};

const serializeStartup = async (startup, userId = null) => {
  if (!startup) {
    return null;
  }

  let creatorProfile = null;
  if (startup.creatorType === "user" && startup.createdBy) {
    const creator = await User.findById(startup.createdBy).select("username profileImage");
    if (creator) {
      creatorProfile = {
        id: creator._id,
        username: creator.username,
        profileImage: creator.profileImage,
      };
    }
  }

  const totalRatings = startup.ratings?.length || 0;
  const totalRatingValue =
    startup.ratings?.reduce((accumulator, entry) => accumulator + entry.rating, 0) || 0;
  const averageRating = totalRatings > 0 ? Number((totalRatingValue / totalRatings).toFixed(1)) : 0;

  const liked = userId
    ? startup.likes?.some((likeId) => likeId.toString() === userId.toString()) || false
    : false;
  const currentRating =
    startup.ratings?.find((entry) => entry.user.toString() === userId?.toString())?.rating || 0;

  return {
    ...startup.toObject(),
    status: normalizeStatus(startup.status),
    imageUrl: startup.image ? `${getApiOrigin()}${startup.image}` : FALLBACK_IMAGE,
    startupImage: startup.image ? `${getApiOrigin()}${startup.image}` : FALLBACK_IMAGE,
    tags:
      startup.tags?.length
        ? startup.tags
        : normalizeTags(startup.category, startup.stage, startup.location),
    totalLikes: startup.likes?.length || 0,
    totalRatings,
    averageRating,
    liked,
    currentRating,
    creatorProfile,
  };
};

const validateStartupPayload = (payload) => {
  const requiredFields = [
    "title",
    "description",
    "category",
    "stage",
    "contactEmail",
  ];

  const missingField = requiredFields.find((field) => !String(payload[field] || "").trim());
  if (missingField) {
    return `${missingField} is required`;
  }

  return "";
};

export const createStartup = async (req, res) => {
  try {
    const actor = getActor(req);
    const validationError = validateStartupPayload(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const imagePath = buildImagePath(req.file);
    const founderName = req.body.founderName || actor.name || req.body.title;
    const tags = normalizeTags(req.body.tags, req.body.category, req.body.stage, req.body.location);

    const startup = await Startup.create({
      title: req.body.title,
      tagline: req.body.tagline || "",
      description: req.body.description,
      category: req.body.category,
      problem: req.body.problem || "",
      solution: req.body.solution || "",
      vision: req.body.vision || "",
      stage: req.body.stage,
      location: req.body.location || "",
      website: req.body.website || "",
      tags,
      companyName: actor.type === "admin" ? "NAVAVERSE" : req.body.companyName || req.body.title,
      founderName,
      contactEmail: req.body.contactEmail,
      image: imagePath,
      startupImage: imagePath,
      createdBy: actor.id,
      creatorType: actor.type,
      creatorName: actor.name,
      creatorEmail: actor.email,
      status: actor.type === "admin" ? "Approved" : "Pending",
      reviewedBy: actor.type === "admin" ? actor.id : "",
      isAdminPost: actor.type === "admin",
    });

    return res.status(201).json({
      success: true,
      message:
        actor.type === "admin"
          ? "Startup created successfully"
          : "Your startup is under review",
      item: await serializeStartup(startup, req.user?._id),
    });
  } catch (error) {
    console.error("Create Startup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create startup",
    });
  }
};

export const getPublicStartups = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0;
    const query = Startup.find({ status: { $in: APPROVED_STATUSES } }).sort({ createdAt: -1 });

    if (limit > 0) {
      query.limit(limit);
    }

    const startups = await query;
    const items = await Promise.all(startups.map((startup) => serializeStartup(startup, req.user?._id)));

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get Public Startups Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch startups",
    });
  }
};

export const getPublicStartupById = async (req, res) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.id,
      status: { $in: APPROVED_STATUSES },
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const [comments, relatedStartups, serializedStartup, collaboration] = await Promise.all([
      StartupDiscussion.find({ startupId: startup._id })
        .populate("userId", "username profileImage")
        .sort({ createdAt: -1 }),
      Startup.find({
        _id: { $ne: startup._id },
        status: { $in: APPROVED_STATUSES },
        $or: [{ category: startup.category }, { stage: startup.stage }],
      })
        .sort({ createdAt: -1 })
        .limit(4),
      serializeStartup(startup, req.user?._id),
      req.user?._id
        ? StartupCollaboration.findOne({
            applicantId: req.user._id,
            startupId: startup._id,
          })
        : null,
    ]);

    const saved = req.user?._id
      ? Boolean(
          (await User.findById(req.user._id).select("savedStartups"))?.savedStartups?.some(
            (savedId) => savedId.toString() === startup._id.toString()
          )
        )
      : false;

    return res.status(200).json({
      success: true,
      item: {
        ...serializedStartup,
        saved,
        hasApplied: Boolean(collaboration),
        canCollaborate:
          Boolean(req.user?._id) &&
          String(startup.createdBy) !== String(req.user?._id) &&
          normalizeStatus(startup.status) === "Approved",
        comments: comments.map((comment) => ({
          ...comment.toObject(),
          text: comment.message,
        })),
        relatedStartups: await Promise.all(
          relatedStartups.map((relatedStartup) => serializeStartup(relatedStartup, req.user?._id))
        ),
      },
    });
  } catch (error) {
    console.error("Get Startup Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch startup",
    });
  }
};

export const getUserStartups = async (req, res) => {
  try {
    const items = await Startup.find({ createdBy: String(req.user._id) })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      items: items.map((item) => ({ ...item, status: normalizeStatus(item.status) })),
    });
  } catch (error) {
    console.error("Get User Startups Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your startups",
    });
  }
};

export const getAdminStartups = async (req, res) => {
  try {
    const items = await Startup.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      items: items.map((item) => ({ ...item, status: normalizeStatus(item.status) })),
    });
  } catch (error) {
    console.error("Get Admin Startups Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch startups",
    });
  }
};

export const getPendingStartups = async (req, res) => {
  try {
    const items = await Startup.find({ status: { $in: PENDING_STATUSES } })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      items: items.map((item) => ({ ...item, status: normalizeStatus(item.status) })),
    });
  } catch (error) {
    console.error("Get Pending Startups Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending startups",
    });
  }
};

export const updateStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    if (!isOwnerOrAdmin(startup, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this startup",
      });
    }

    const actor = getActor(req);
    const updates = {
      title: req.body.title ?? startup.title,
      tagline: req.body.tagline ?? startup.tagline,
      description: req.body.description ?? startup.description,
      category: req.body.category ?? startup.category,
      problem: req.body.problem ?? startup.problem,
      solution: req.body.solution ?? startup.solution,
      vision: req.body.vision ?? startup.vision,
      stage: req.body.stage ?? startup.stage,
      location: req.body.location ?? startup.location,
      website: req.body.website ?? startup.website,
      tags: normalizeTags(
        req.body.tags ?? startup.tags?.join(","),
        req.body.category ?? startup.category,
        req.body.stage ?? startup.stage,
        req.body.location ?? startup.location
      ),
      companyName:
        actor.type === "admin"
          ? "NAVAVERSE"
          : req.body.companyName ?? startup.companyName ?? startup.title,
      founderName: req.body.founderName ?? startup.founderName ?? actor.name,
      contactEmail: req.body.contactEmail ?? startup.contactEmail,
      creatorName: actor.name,
      creatorEmail: actor.email,
      status: actor.type === "admin" ? "Approved" : "Pending",
      reviewedBy: actor.type === "admin" ? actor.id : "",
      rejectionReason: "",
      isAdminPost: actor.type === "admin",
    };

    Object.assign(startup, updates);

    if (req.file) {
      startup.image = buildImagePath(req.file);
      startup.startupImage = startup.image;
    }

    await startup.save();

    return res.status(200).json({
      success: true,
      message: "Startup updated successfully",
      item: await serializeStartup(startup, req.user?._id),
    });
  } catch (error) {
    console.error("Update Startup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update startup",
    });
  }
};

export const deleteStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    if (!isOwnerOrAdmin(startup, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this startup",
      });
    }

    await Promise.all([
      Startup.findByIdAndDelete(req.params.id),
      StartupDiscussion.deleteMany({ startupId: req.params.id }),
      StartupCollaboration.deleteMany({ startupId: req.params.id }),
      User.updateMany({}, { $pull: { savedStartups: startup._id } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Startup deleted successfully",
    });
  } catch (error) {
    console.error("Delete Startup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete startup",
    });
  }
};

export const approveStartup = async (req, res) => {
  try {
    const item = await Startup.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        reviewedBy: String(req.admin.id),
        rejectionReason: "",
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Startup approved successfully",
      item,
    });
  } catch (error) {
    console.error("Approve Startup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve startup",
    });
  }
};

export const rejectStartup = async (req, res) => {
  try {
    const item = await Startup.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        reviewedBy: String(req.admin.id),
        rejectionReason: req.body.rejectionReason || "",
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Startup rejected successfully",
      item,
    });
  } catch (error) {
    console.error("Reject Startup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject startup",
    });
  }
};

export const getStartupDiscussions = async (req, res) => {
  try {
    const discussions = await StartupDiscussion.find({ startupId: req.params.id })
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      discussions: discussions.map((discussion) => ({
        ...discussion.toObject(),
        text: discussion.message,
      })),
    });
  } catch (error) {
    console.error("Get Startup Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

export const createStartupDiscussion = async (req, res) => {
  try {
    if (!req.body.message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const startup = await Startup.findOne({
      _id: req.params.id,
      status: { $in: APPROVED_STATUSES },
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const discussion = await StartupDiscussion.create({
      startupId: req.params.id,
      userId: req.user._id,
      message: req.body.message.trim(),
    });

    const populatedDiscussion = await StartupDiscussion.findById(discussion._id).populate(
      "userId",
      "username profileImage"
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      discussion: {
        ...populatedDiscussion.toObject(),
        text: populatedDiscussion.message,
      },
    });
  } catch (error) {
    console.error("Create Startup Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

export const toggleStartupLike = async (req, res) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.id,
      status: { $in: APPROVED_STATUSES },
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = startup.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      startup.likes = startup.likes.filter((id) => id.toString() !== userId);
    } else {
      startup.likes.push(req.user._id);
    }

    await startup.save();

    return res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      totalLikes: startup.likes.length,
    });
  } catch (error) {
    console.error("Toggle Startup Like Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update like",
    });
  }
};

export const toggleStartupSave = async (req, res) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.id,
      status: { $in: APPROVED_STATUSES },
    }).select("_id");

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const user = await User.findById(req.user._id);
    const savedIndex = user.savedStartups.findIndex(
      (savedId) => savedId.toString() === startup._id.toString()
    );

    if (savedIndex >= 0) {
      user.savedStartups.splice(savedIndex, 1);
    } else {
      user.savedStartups.push(startup._id);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      saved: savedIndex < 0,
    });
  } catch (error) {
    console.error("Toggle Startup Save Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update save",
    });
  }
};

export const rateStartup = async (req, res) => {
  try {
    const rating = Number(req.body.rating);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating",
      });
    }

    const startup = await Startup.findOne({
      _id: req.params.id,
      status: { $in: APPROVED_STATUSES },
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const existingRating = startup.ratings.find(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this startup",
      });
    }

    startup.ratings.push({
      user: req.user._id,
      rating,
    });
    await startup.save();

    const totalRatings = startup.ratings.length;
    const averageRating = Number(
      (
        startup.ratings.reduce((accumulator, entry) => accumulator + entry.rating, 0) /
        totalRatings
      ).toFixed(1)
    );

    return res.status(200).json({
      success: true,
      message: "Rating added successfully",
      averageRating,
      totalRatings,
    });
  } catch (error) {
    console.error("Rate Startup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to rate startup",
    });
  }
};

export const collaborateOnStartup = async (req, res) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.id,
      status: { $in: APPROVED_STATUSES },
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    if (startup.createdBy === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot collaborate on your own startup",
      });
    }

    const existingRequest = await StartupCollaboration.findOne({
      applicantId: req.user._id,
      startupId: startup._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to collaborate on this startup",
      });
    }

    const collaboration = await StartupCollaboration.create({
      applicantId: req.user._id,
      startupId: startup._id,
      ownerId: startup.createdBy,
      ownerType: startup.creatorType,
      name: req.body.name || req.user.username,
      email: req.body.email || req.user.email,
      role: req.body.role,
      skills: req.body.skills || "",
      message: req.body.message || "",
    });

    return res.status(201).json({
      success: true,
      message: "Collaboration request sent successfully",
      request: collaboration,
    });
  } catch (error) {
    console.error("Collaborate On Startup Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to collaborate on this startup",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send collaboration request",
    });
  }
};

export const getUserCollaborationRequests = async (req, res) => {
  try {
    const requests = await StartupCollaboration.find({
      ownerId: String(req.user._id),
      ownerType: "user",
    })
      .populate("applicantId", "username email profileImage")
      .populate("startupId", "title companyName stage image status creatorName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items: requests,
    });
  } catch (error) {
    console.error("Get User Collaboration Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch collaboration requests",
    });
  }
};

export const getAdminCollaborationRequests = async (req, res) => {
  try {
    const requests = await StartupCollaboration.find({
      ownerId: String(req.admin.id),
      ownerType: "admin",
    })
      .populate("applicantId", "username email profileImage")
      .populate("startupId", "title companyName stage image status creatorName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items: requests,
    });
  } catch (error) {
    console.error("Get Admin Collaboration Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch collaboration requests",
    });
  }
};

export const getAppliedCollaborations = async (req, res) => {
  try {
    const items = await StartupCollaboration.find({ applicantId: req.user._id })
      .populate("startupId", "title companyName stage image status creatorName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get Applied Collaborations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your collaboration requests",
    });
  }
};

export const updateCollaborationStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const actor = getActor(req);

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update",
      });
    }

    const request = await StartupCollaboration.findById(req.params.requestId)
      .populate("applicantId", "username email profileImage")
      .populate("startupId", "title companyName stage image status creatorName");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Collaboration request not found",
      });
    }

    if (request.ownerId !== actor.id || request.ownerType !== actor.type) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this request",
      });
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Collaboration request ${status.toLowerCase()} successfully`,
      item: request,
    });
  } catch (error) {
    console.error("Update Collaboration Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update collaboration request",
    });
  }
};
