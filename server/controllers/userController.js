import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const getGoogleClientIds = () =>
  (process.env.GOOGLE_CLIENT_ID || "")
    .split(",")
    .map((clientId) => clientId.trim())
    .filter(Boolean);

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

const googleClient = new OAuth2Client();

const sendResetEmail = async ({ email, resetUrl }) => {
  const requiredMailConfig = [
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
  ];

  if (requiredMailConfig.some((value) => !value)) {
    console.log(`[Auth] SMTP not configured. Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"NAVAVERSE" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your NAVAVERSE password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Reset your NAVAVERSE password</h2>
        <p>Use the secure link below to set a new password. It expires in 15 minutes.</p>
        <p><a href="${resetUrl}" style="color:#2563eb">Reset Password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

/* ================= AUTH CONFIG ================= */
export const getAuthConfig = async (req, res) => {
  res.json({
    mailConfigured: Boolean(
      process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    ),
  });
};

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const username = (req.body.username || req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name: username,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = createToken(user._id);

    res.status(201).json({ token, user: sanitizeUser(user) });

  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.json({ token, user: sanitizeUser(user) });

  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GOOGLE AUTH ================= */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const googleClientIds = getGoogleClientIds();

    if (!googleClientIds.length) {
      return res.status(500).json({ message: "Google authentication is not configured" });
    }

    if (!credential) {
      return res.status(400).json({ message: "Google authentication token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientIds,
    });

    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = normalizeEmail(payload?.email);
    const name = (payload?.name || payload?.given_name || email.split("@")[0] || "").trim();
    const profileImage = payload?.picture || "";

    if (!googleId || !email || !payload?.email_verified) {
      return res.status(401).json({ message: "Invalid Google account" });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] }).select("+password");

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (!user.name && name) user.name = name;
      if (!user.username && name) user.username = name;
      if (!user.profileImage && profileImage) user.profileImage = profileImage;
      await user.save();
    } else {
      user = await User.create({
        username: name,
        name,
        email,
        googleId,
        profileImage,
        role: "user",
      });
    }

    const token = createToken(user._id);

    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("[Auth] Google auth error:", error?.message || error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordExpire"
    );

    if (!user) {
      return res.json({
        message: "If this email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendResetEmail({ email: user.email, resetUrl });

    const response = {
      message: "If this email exists, a password reset link has been sent.",
    };

    if (process.env.NODE_ENV !== "production" && !process.env.SMTP_HOST) {
      response.devResetUrl = resetUrl;
    }

    res.json(response);
  } catch (error) {
    console.error("[Auth] Forgot password error:", error?.message || error);
    res.status(500).json({ message: "Unable to send reset email" });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpire = null;
    await user.save();

    const authToken = createToken(user._id);
    res.json({ token: authToken, message: "Password reset successful" });
  } catch (error) {
    console.error("[Auth] Reset password error:", error?.message || error);
    res.status(500).json({ message: "Unable to reset password" });
  }
};

/* ================= GET PROFILE ================= */
export const getMyProfile = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= UPDATE PROFILE PHOTO ================= */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({ user });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET PUBLIC PROFILE ================= */
export const getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username profileImage createdAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Public Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
