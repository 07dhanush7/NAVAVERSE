import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";

const canManageRegistration = (eventItem, req) => {
  if (!eventItem?.createdBy) {
    return false;
  }

  if (req.admin) {
    return eventItem.creatorRole === "admin" && eventItem.createdBy === req.admin.id;
  }

  return Boolean(req.user?._id && eventItem.createdBy === req.user._id.toString());
};

const buildDuplicateRegistrationQuery = (userId, eventId) => ({
  $or: [
    { userId, eventId },
    { userId: { $exists: false }, applicantId: userId, eventId },
  ],
});

export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const eventId = req.params?.id || null;

    if (!userId || !eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    const eventItem = await Event.findOne({ _id: eventId, status: "approved" }).select(
      "title createdBy creatorRole status"
    );

    if (!eventItem) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!eventItem.createdBy) {
      return res.status(400).json({
        success: false,
        message: "This event is missing an owner and cannot accept registrations",
      });
    }

    if (eventItem.createdBy === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot register for your own event",
      });
    }

    console.log("[EventRegistration] Duplicate check input", {
      userId: userId.toString(),
      eventId: eventId.toString(),
    });

    const duplicateRegistration = await EventRegistration.findOne(
      buildDuplicateRegistrationQuery(userId, eventId)
    ).select("_id userId applicantId eventId");

    console.log("[EventRegistration] Duplicate check result", {
      userId: userId.toString(),
      eventId: eventId.toString(),
      duplicateFound: Boolean(duplicateRegistration),
      duplicateRegistrationId: duplicateRegistration?._id?.toString() || null,
    });

    if (duplicateRegistration) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for this event",
      });
    }

    const registration = await EventRegistration.create({
      eventId,
      eventTitle: eventItem.title,
      userId,
      userName: req.user.username,
      applicantId: userId,
      applicantName: req.user.username,
      email: req.user.email,
      phoneNumber: req.body.phone || "",
      phone: req.body.phone || "",
      receiverId: eventItem.createdBy,
      status: "Pending",
    });

    return res.status(200).json({
      success: true,
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Register For Event Error:", {
      code: error.code,
      message: error.message,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
    });

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for this event",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getRegistrationsForMyEvents = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      receiverId: req.user._id.toString(),
    })
      .populate("eventId", "title organizer date time location")
      .sort({ createdAt: -1 });

    const items = registrations.map((registration) => ({
      _id: registration._id,
      event: {
        _id: registration.eventId?._id || null,
        title: registration.eventId?.title || registration.eventTitle,
        organizer: registration.eventId?.organizer || "",
        date: registration.eventId?.date || "",
        time: registration.eventId?.time || "",
        location: registration.eventId?.location || "",
      },
      applicantName: registration.userName || registration.applicantName,
      email: registration.email,
      phone: registration.phone,
      status: registration.status,
      registeredAt: registration.createdAt,
    }));

    return res.status(200).json({
      success: true,
      items,
      registrations: items,
    });
  } catch (error) {
    console.error("Get Registrations For My Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations for your events",
    });
  }
};

export const getAdminRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      receiverId: req.admin.id,
    })
      .populate("eventId", "title organizer date time location creatorRole")
      .sort({ createdAt: -1 });

    const items = registrations.map((registration) => ({
      _id: registration._id,
      event: {
        _id: registration.eventId?._id || null,
        title: registration.eventId?.title || registration.eventTitle,
        organizer: registration.eventId?.organizer || "",
        date: registration.eventId?.date || "",
        time: registration.eventId?.time || "",
        location: registration.eventId?.location || "",
      },
      applicantName: registration.userName || registration.applicantName,
      email: registration.email,
      phone: registration.phone,
      status: registration.status,
      registeredAt: registration.createdAt,
    }));

    return res.status(200).json({
      success: true,
      items,
      registrations: items,
    });
  } catch (error) {
    console.error("Get Admin Registrations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin registrations",
    });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration status",
      });
    }

    const currentRegistration = await EventRegistration.findById(registrationId).populate(
      "eventId",
      "createdBy creatorRole"
    );

    if (!currentRegistration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (!canManageRegistration(currentRegistration.eventId, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this registration",
      });
    }

    const registration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      { status },
      { new: true }
    ).populate("eventId", "title organizer date time location");

    return res.status(200).json({
      success: true,
      message: "Registration status updated successfully",
      registration: {
        _id: registration._id,
        applicantName: registration.userName || registration.applicantName,
        email: registration.email,
        phone: registration.phone,
        status: registration.status,
        registeredAt: registration.createdAt,
        event: {
          _id: registration.eventId?._id || null,
          title: registration.eventId?.title || registration.eventTitle,
          organizer: registration.eventId?.organizer || "",
          date: registration.eventId?.date || "",
          time: registration.eventId?.time || "",
          location: registration.eventId?.location || "",
        },
      },
    });
  } catch (error) {
    console.error("Update Registration Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update registration status",
    });
  }
};
