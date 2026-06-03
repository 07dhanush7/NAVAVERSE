import Blog from "../models/Blog.js";
import { generateBlogContent } from "../helpers/ai.js";
import { ensureReadableHtml } from "../helpers/contentSanitizer.js";

const approvedBlogStatusFilter = {
  isPublished: true,
  status: { $in: ["approved", null] },
};

const pendingBlogStatusFilter = {
  isPublished: false,
  status: { $in: ["pending", null] },
};
//dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ isPublished: true });
    const draftBlogs = await Blog.countDocuments({ isPublished: false });

    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
        },
      },
    ]);

    res.json({
      success: true,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews: stats[0]?.totalViews || 0,
      totalLikes: stats[0]?.totalLikes || 0,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};
/* ===== CREATE BLOG ===== */
export const createBlog = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });

    const blogData = JSON.parse(req.body.blog);
    const description = ensureReadableHtml(blogData.description);
    const nextPublishedState = Boolean(blogData.isPublished);

    const newBlog = await Blog.create({
      ...blogData,
      description,
      authorName: "NAVAVERSE",
      image: `/uploads/${req.file.filename}`,
      isPublished: nextPublishedState,
      status: nextPublishedState ? "approved" : "pending",
      rejectionReason: "",
    });

    res.status(201).json({ success: true, message: "Blog created successfully", blog: newBlog });

  } catch (error) {
    console.error("Create Blog Error:", error);
    if (error?.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Blog creation failed" });
  }
};

/* ===== AI BLOG GENERATION ===== */
export const generateBlog = async (req, res) => {
  try {
    const { prompt, topic, category } = req.body;
    const blogTopic = String(prompt || topic || "").trim();

    if (!blogTopic) {
      return res.status(400).json({ success: false, message: "Please enter a topic to generate blog content." });
    }

    const generated = await generateBlogContent(blogTopic, category);

    res.json({
      success: true,
      content: generated.markdown || generated.content,
      html: generated.html,
      wordCount: generated.wordCount,
      source: generated.source,
    });

  } catch (error) {
    console.error("AI Error:", error);

    if (error?.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Unable to generate blog. Please try again." });
  }
};

/* ===== GET ALL PUBLISHED BLOGS ===== */
export const getAllBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { ...approvedBlogStatusFilter };

    // Filter by category if provided
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // Search in title, description, and category
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 });

    res.json({ success: true, blogs });

  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
};

/* ===== ADMIN GET ALL BLOGS ===== */
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .select("title views likes isPublished status createdAt");

    const formattedBlogs = blogs.map((blog) => ({
      _id: blog._id,
      title: blog.title,
      views: blog.views || 0,
      totalLikes: blog.likes?.length || 0,
      isPublished: blog.isPublished,
      status: blog.status,
      createdAt: blog.createdAt
    }));

    res.status(200).json(formattedBlogs);
  } catch (error) {
    console.error("Admin Blogs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===== TOGGLE PUBLISH ===== */
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    blog.isPublished = !blog.isPublished;
    blog.status = blog.isPublished ? "approved" : "pending";
    if (blog.isPublished) {
      blog.rejectionReason = "";
    }
    await blog.save();

    res.json({
      success: true,
      message: blog.isPublished ? "Blog Published successfully" : "Blog Unpublished successfully",
    });

  } catch (error) {
    console.error("Toggle Publish Error:", error);
    res.status(500).json({ success: false, message: "Failed to update blog status" });
  }
};

/* ===== TOGGLE FEATURED ===== */
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    blog.isFeatured = !blog.isFeatured;
    await blog.save();

    res.json({
      success: true,
      message: blog.isFeatured ? "Blog marked as featured" : "Blog removed from featured",
    });
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    res.status(500).json({ success: false, message: "Failed to update featured status" });
  }
};

/* ===== TOGGLE UPCOMING ===== */
export const toggleUpcoming = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    blog.isUpcoming = !blog.isUpcoming;
    await blog.save();

    res.json({
      success: true,
      message: blog.isUpcoming ? "Blog marked as upcoming" : "Blog removed from upcoming",
    });
  } catch (error) {
    console.error("Toggle Upcoming Error:", error);
    res.status(500).json({ success: false, message: "Failed to update upcoming status" });
  }
};

/* ===== TOGGLE LIKE ===== */
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (!blog.likes) blog.likes = [];

    const userId = req.user.id;

    const alreadyLiked = blog.likes.some(id => id.toString() === userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      success: true,
      totalLikes: blog.likes.length,
      liked: !alreadyLiked,
    });

  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ success: false, message: "Like failed" });
  }
};

/* ===== RATE BLOG ===== */
export const rateBlog = async (req, res) => {
  try {
    const { rating } = req.body;
    const userId = req.user.id;
    const blogId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    // Check if user already rated
    const existingRatingIndex = blog.ratings.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      blog.ratings[existingRatingIndex].rating = rating;
    } else {
      blog.ratings.push({ user: userId, rating });
    }

    await blog.save();

    res.json({ success: true, message: "Rating saved successfully" });

  } catch (error) {
    console.error("Rate Blog Error:", error);
    res.status(500).json({ success: false, message: "Rating failed" });
  }
};

/* ===== GET FEATURED BLOGS ===== */
export const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ ...approvedBlogStatusFilter, isFeatured: true })
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    console.error("Get Featured Blogs Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch featured blogs" });
  }
};

/* ===== GET UPCOMING BLOGS ===== */
export const getUpcomingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ ...approvedBlogStatusFilter, isUpcoming: true })
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    console.error("Get Upcoming Blogs Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch upcoming blogs" });
  }
};

/* ===== GET SINGLE BLOG WITH UNIQUE VIEW LOGIC ===== */
export const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      ...approvedBlogStatusFilter,
    }).populate("creator", "username profileImage");

    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const userId = req.user?._id || req.user?.id;

    if (userId) {
      const alreadyViewed = blog.viewedBy.some(
        (id) => id.toString() === userId.toString()
      );

      if (!alreadyViewed) {
        blog.views += 1;
        blog.viewedBy.push(userId);
      }
    } else {
      // ✅ Increment for guest users
      blog.views += 1;
    }

    await blog.save();

    res.json({ success: true, blog });
  } catch (error) {
    console.error("Get Single Blog Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog" });
  }
};
/**
 * Controller: Create a blog submitted by a user
 * This blog will be created but not published until admin approval.
 */
export const createUserBlog = async (req, res) => {
  try {
    // Extract fields from request body
    const { title, subTitle, description, category } = req.body;

    /**
     * Validate required fields
     * Title and description are mandatory for blog creation
     */
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const cleanDescription = ensureReadableHtml(description);

    /**
     * Handle uploaded image
     * If multer middleware attaches a file, store its path
     */
    let imagePath = "";

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    /**
     * Create a new blog document in the database
     * Default flags are set to false until admin approval
     */
    const blog = await Blog.create({
      title,
      subTitle,
      description: cleanDescription,
      category,
      image: imagePath,
      creator: req.user._id, // Authenticated user
      status: "pending",
      rejectionReason: "",
      isPublished: false,
      isFeatured: false,
      isUpcoming: false,
    });

    /**
     * Send success response
     */
    res.status(201).json({
      success: true,
      message: "Your submission is under review",
      blog,
    });

  } catch (error) {
    /**
     * Handle unexpected server errors
     */
    console.error("Create user blog error:", error);
    if (error?.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating blog",
    });
  }
};
//user sending Add to admin
export const updateBlogByAdmin = async (req, res) => {
  try {
    const payload = req.body.blog ? JSON.parse(req.body.blog) : req.body;
    const {
      title,
      subTitle,
      category,
      isFeatured,
      isUpcoming,
      isPublished,
      status,
      rejectionReason,
      description,
    } = payload;
    const hasPublishedState = typeof isPublished === "boolean";
    const nextStatus = status || (hasPublishedState ? (isPublished ? "approved" : "pending") : undefined);
    const updates = {
      ...(typeof title === "string" ? { title: title.trim() } : {}),
      ...(typeof subTitle === "string" ? { subTitle: subTitle.trim() } : {}),
      ...(typeof category === "string" ? { category } : {}),
      ...(typeof isFeatured === "boolean" ? { isFeatured } : {}),
      ...(typeof isUpcoming === "boolean" ? { isUpcoming } : {}),
    };

    if (nextStatus) {
      updates.isPublished = nextStatus === "approved" ? true : Boolean(isPublished && nextStatus !== "rejected");
      updates.status = nextStatus;
      updates.rejectionReason = nextStatus === "rejected" ? rejectionReason || "" : "";
    } else if (hasPublishedState) {
      updates.isPublished = isPublished;
    }

    if (typeof description === "string") {
      updates.description = ensureReadableHtml(description);
    }

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      message: "Blog updated successfully",
      blog
    });

  } catch (error) {
    console.error("Admin update blog error:", error);
    if (error?.statusCode === 400 || error instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid blog data"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update blog"
    });

  }
};
export const getPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      ...pendingBlogStatusFilter,
      creator: { $ne: null },
    })
      .populate("creator", "username email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      blogs
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};
