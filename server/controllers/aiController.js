import { getBlogInsights, getNavaverseAssistantReply } from "../helpers/ai.js";

export const getInsights = async (req, res) => {
  try {
    const { blogTitle, blogContent } = req.body;
    
    if (!blogTitle || !blogContent) {
      return res.status(400).json({ success: false, message: "Blog title and content are required" });
    }

    const insights = await getBlogInsights(blogTitle, blogContent);

    res.json({
      success: true,
      summary: insights.summary,
      suggestions: insights.suggestions,
    });
  } catch (error) {
    console.error("AI Insights Controller Error:", error);
    res.status(500).json({ success: false, message: "AI insights generation failed" });
  }
};

export const getChatbotResponse = async (req, res) => {
  try {
    const { message, context } = req.body;

    const result = await getNavaverseAssistantReply(message, context);

    if (!result.allowed) {
      return res.status(200).json({
        success: true,
        reply: result.reply,
        route: null,
      });
    }

    return res.json({
      success: true,
      reply: result.reply,
      route: result.route || null,
    });
  } catch (error) {
    console.error("AI Chatbot Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
    });
  }
};
