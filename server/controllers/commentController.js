import Comment from "../models/Comment.js";

/* ================= CREATE COMMENT ================= */
export const createComment = async (req, res) => {
  try {
    const blogId = req.params.blogId;

    const comment = await Comment.create({
      blog: blogId,
      user: req.user._id,
      content: req.body.content,
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      comment,
    });

  } catch (error) {
    console.error("Create Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Comment failed",
    });
  }
};


/* ================= GET COMMENTS ================= */
export const getComments = async (req, res) => {
  try {
    const blogId = req.params.blogId;

    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments,
    });

  } catch (error) {
    console.error("Get Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};