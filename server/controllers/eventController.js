import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import User from "../models/User.js";

const buildImagePath = (file) => (file ? `/uploads/${file.filename}` : "");

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

const isOwnerOrAdmin = (event, req) => {
  if (req.admin) {
    return true;
  }

  return Boolean(req.user?._id && event.createdBy === req.user._id.toString());
};

const getCreatorDetails = async (eventItem) => {
  if (eventItem.creatorRole === "admin" || !mongoose.Types.ObjectId.isValid(eventItem.createdBy)) {
    return {
      creatorName: "Admin",
      creatorEmail: process.env.ADMIN_EMAIL || "",
    };
  }

  const owner = await User.findById(eventItem.createdBy).select("username email");

  return {
    creatorName: owner?.username || owner?.email || "Unknown User",
    creatorEmail: owner?.email || "",
  };
};

const mapEventList = async (events) =>
  Promise.all(
    events.map(async (eventItem) => ({
      ...eventItem,
      ...(await getCreatorDetails(eventItem)),
    }))
  );

export const createEvent = async (req, res) => {
  try {
    const actor = getActorIdentity(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create an event",
      });
    }

    const item = await Event.create({
      title: req.body.title,
      organizer: req.body.organizer,
      location: req.body.location,
      date: req.body.date,
      time: req.body.time,
      description: req.body.description,
      image: buildImagePath(req.file),
      createdBy: actor.id,
      creatorRole: actor.role,
      status: actor.role === "admin" ? "approved" : "pending",
      reviewedBy: actor.role === "admin" ? actor.id : null,
      rejectionReason: "",
    });

    return res.status(201).json({
      success: true,
      message:
        actor.role === "admin"
          ? "Event created successfully"
          : "Event submitted. Waiting for admin approval.",
      item,
      event: item,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

export const getPublicEvents = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0;
    const query = Event.find({ status: "approved" }).sort({ createdAt: -1 }).lean();

    if (limit > 0) {
      query.limit(limit);
    }

    const events = await query;
    const items = await mapEventList(events);

    return res.status(200).json({
      success: true,
      items,
      events: items,
    });
  } catch (error) {
    console.error("Get Public Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

export const getPublicEventById = async (req, res) => {
  try {
    const eventItem = await Event.findOne({
      _id: req.params.id,
      status: "approved",
    }).lean();

    if (!eventItem) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const item = {
      ...eventItem,
      ...(await getCreatorDetails(eventItem)),
    };

    return res.status(200).json({
      success: true,
      item,
      event: item,
    });
  } catch (error) {
    console.error("Get Event Detail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const items = await Event.find({ createdBy: req.user._id.toString() }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
      events: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
    });
  }
};

export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    const items = await mapEventList(events);

    return res.status(200).json({
      success: true,
      items,
      events: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
    const items = await mapEventList(events);

    return res.status(200).json({
      success: true,
      items,
      events: items,
    });
  } catch (error) {
    console.error("Get Pending Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending events",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!isOwnerOrAdmin(item, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    item.title = req.body.title ?? item.title;
    item.organizer = req.body.organizer ?? item.organizer;
    item.location = req.body.location ?? item.location;
    item.date = req.body.date ?? item.date;
    item.time = req.body.time ?? item.time;
    item.description = req.body.description ?? item.description;

    if (req.file) {
      item.image = buildImagePath(req.file);
    }

    if (req.admin) {
      item.createdBy = req.admin.id;
      item.creatorRole = "admin";
      item.status = "approved";
      item.reviewedBy = req.admin.id;
      item.rejectionReason = "";
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
      message: "Event updated successfully",
      item,
      event: item,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!isOwnerOrAdmin(item, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    await EventRegistration.deleteMany({ eventId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

export const approveEvent = async (req, res) => {
  try {
    const item = await Event.findByIdAndUpdate(
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
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event approved successfully",
      item,
      event: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve event",
    });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const item = await Event.findByIdAndUpdate(
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
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event rejected successfully",
      item,
      event: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject event",
    });
  }
};
