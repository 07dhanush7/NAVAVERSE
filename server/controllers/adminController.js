import jwt from "jsonwebtoken";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Subscription from "../models/Subscription.js";

/* =========================================
   ADMIN LOGIN
========================================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Example simple admin check
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: "admin-id",
        role: "admin",   // 🔥 THIS IS THE IMPORTANT PART
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* =========================================
   DASHBOARD STATS
========================================= */
export const getDashboardData = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    // Use { $ne: true } for drafts to catch false/undefined
    const drafts = await Blog.countDocuments({ isPublished: { $ne: true } });
    const published = await Blog.countDocuments({ isPublished: true });
    const totalComments = await Comment.countDocuments();
    const approvedComments = await Comment.countDocuments({ isApproved: true });
    const totalSubscribers = await Subscription.countDocuments();

    // Calculate total views and total likes
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      dashboardData: {
        totalBlogs,
        totalComments,
        approvedComments,
        totalSubscribers,
        drafts,
        published,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes: stats[0]?.totalLikes || 0,
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};


/* =========================================
   GET ALL BLOGS (ADMIN)
========================================= */
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      blogs,
    });

  } catch (error) {
    console.error("Get Admin Blogs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

export const getAdminBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });

  } catch (error) {
    console.error("Get Admin Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
    });
  }
};


/* =========================================
   DELETE BLOG
========================================= */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });

  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Blog deletion failed",
    });
  }
};


/* =========================================
   GET ALL COMMENTS (ADMIN)
========================================= */
export const getAdminComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("blog", "title")
      .populate("user", "username")
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


/* =========================================
   APPROVE COMMENT
========================================= */
export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment approved",
    });

  } catch (error) {
    console.error("Approve Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Approval failed",
    });
  }
};


/* =========================================
   DELETE COMMENT
========================================= */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted",
    });

  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};


/* =========================================
   CATEGORY ANALYTICS
========================================= */
export const getCategoryAnalytics = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      categories,
    });

  } catch (error) {
    console.error("Category Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category analytics",
    });
  }
};


/* =========================================
   PERFORMANCE STATS
========================================= */
export const getPerformanceStats = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    const formattedBlogs = blogs.map(blog => {
      const totalRatings = blog.ratings?.length || 0;
      const sumRatings = blog.ratings?.reduce((acc, curr) => acc + curr.rating, 0) || 0;
      const avgRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

      return {
        ...blog._doc,
        avgRating,
        totalRatings
      };
    });

    return res.status(200).json({
      success: true,
      blogs: formattedBlogs,
    });

  } catch (error) {
    console.error("Performance Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch performance stats",
    });
  }
};


/* =========================================
   CALENDAR DATA
========================================= */
export const getCalendarData = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select("title createdAt isPublished")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      blogs,
    });

  } catch (error) {
    console.error("Calendar Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendar data",
    });
  }
};
