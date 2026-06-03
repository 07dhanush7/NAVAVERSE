import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const username = (req.body.username || req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name: username,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = jwt.sign(
      { id: user._id },   // ✅ Important
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },   // ✅ Must match middleware
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= GET PROFILE ================= */
export const getMyProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
