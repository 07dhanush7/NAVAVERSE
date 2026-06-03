import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existingSub = await Subscription.findOne({ email });
    if (existingSub) {
      return res.status(400).json({ success: false, message: "Email already subscribed" });
    }

    const newSub = await Subscription.create({ email });

    // Create a notification for the admin
    await Notification.create({
      message: `${email} has subscribed to the newsletter.`,
    });

    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Get Subscriptions Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subscriptions" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};