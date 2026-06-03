import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import startupRoutes from "./routes/startupRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const authDiagnostics = () => {
  console.log(
    "[Auth] SMTP:",
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
      ? "configured"
      : "missing SMTP settings"
  );
  console.log("[Auth] Client URL(s):", allowedOrigins.join(", "));
};

/* =========================================
   CORS FIXED (IMPORTANT)
========================================= */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================================
   Middlewares
========================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================
   Static Folder
========================================= */
app.use("/uploads", express.static("uploads"));

/* =========================================
   API Routes
========================================= */
app.use("/api/users", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/event-registrations", registrationRoutes);

/* =========================================
   Test Route
========================================= */
app.get("/", (req, res) => {
  res.send("NAVAVERSE API Running...");
});

/* =========================================
   404 Handler
========================================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

/* =========================================
   Start Server
========================================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB Connected");
    authDiagnostics();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB Connection Failed");
    console.error(err);
    process.exit(1);
  }
};

startServer();
