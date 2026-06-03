import express from "express";
import { getChatbotResponse, getInsights } from "../controllers/aiController.js";

const router = express.Router();

router.post("/blog-insights", getInsights);
router.post("/chatbot", getChatbotResponse);

export default router;
