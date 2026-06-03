import mongoose from "mongoose";
import Course from "../models/Course.js";
import CourseLesson from "../models/CourseLesson.js";
import CourseComment from "../models/CourseComment.js";
import CourseEnrollment from "../models/CourseEnrollment.js";
import { extractYouTubeVideoId } from "../helpers/youtube.js";
import User from "../models/User.js";

const COURSE_FALLBACK_IMAGE =
  "https://via.placeholder.com/1200x720?text=NAVAVERSE+Course";

const buildImagePath = (file) => (file ? `/uploads/${file.filename}` : "");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getActorIdentity = (req) => {
  if (req.admin?.id) {
    return {
      id: String(req.admin.id),
      role: "admin",
      name: req.admin.name || "Admin",
    };
  }

  if (req.user?._id) {
    return {
      id: req.user._id.toString(),
      role: "user",
      name: req.user.username || req.user.email || "NAVAVERSE User",
    };
  }

  return null;
};

const getCreatorDetails = async (courseDoc) => {
  if (!courseDoc?.createdBy) {
    return {
      createdBy: "",
      creatorRole: courseDoc?.creatorRole || "user",
      creatorName: "NAVAVERSE Creator",
      creatorEmail: "",
      creatorProfileImage: "",
    };
  }

  if (courseDoc.creatorRole === "admin") {
    return {
      createdBy: courseDoc.createdBy,
      creatorRole: "admin",
      creatorName: "Admin",
      creatorEmail: process.env.ADMIN_EMAIL || "",
      creatorProfileImage: "",
    };
  }

  const owner = isValidObjectId(courseDoc.createdBy)
    ? await User.findById(courseDoc.createdBy).select("username email profileImage")
    : null;

  return {
    createdBy: courseDoc.createdBy,
    creatorRole: "user",
    creatorName: owner?.username || owner?.email || "NAVAVERSE Creator",
    creatorEmail: owner?.email || "",
    creatorProfileImage: owner?.profileImage || "",
  };
};

const formatCourseSummary = (courseDoc, lessonCount = 0, creatorDetails = {}) => ({
  _id: courseDoc._id,
  title: courseDoc.title,
  description: courseDoc.description,
  instructor: courseDoc.instructor,
  duration: courseDoc.duration,
  level: courseDoc.level,
  category: courseDoc.category,
  image: courseDoc.image,
  createdAt: courseDoc.createdAt,
  status: courseDoc.status,
  createdBy: creatorDetails.createdBy || courseDoc.createdBy || null,
  creatorRole: creatorDetails.creatorRole || courseDoc.creatorRole || "user",
  creatorName: creatorDetails.creatorName || "NAVAVERSE Creator",
  creatorEmail: creatorDetails.creatorEmail || "",
  creatorProfileImage: creatorDetails.creatorProfileImage || "",
  lessonCount,
});

const parseLessons = (lessonsInput) => {
  if (!lessonsInput) {
    return [];
  }

  if (Array.isArray(lessonsInput)) {
    return lessonsInput;
  }

  if (typeof lessonsInput === "string") {
    try {
      const parsed = JSON.parse(lessonsInput);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const normalizeLessons = (lessonsInput) =>
  parseLessons(lessonsInput)
    .map((lesson, index) => ({
      title: String(lesson?.title || "").trim(),
      videoUrl: String(lesson?.videoUrl || "").trim(),
      duration: String(lesson?.duration || "").trim(),
      description: String(lesson?.description || "").trim(),
      order: index,
    }))
    .filter((lesson) => lesson.title || lesson.videoUrl || lesson.duration || lesson.description);

const validateCoursePayload = ({ title, description, instructor, duration, level, category, lessons }) => {
  if (!title || !description || !instructor || !duration || !level || !category) {
    return "Please fill in all required course fields";
  }

  if (!["Beginner", "Intermediate", "Advanced"].includes(level)) {
    return "Invalid course level";
  }

  if (!lessons.length) {
    return "Add at least one lesson before submitting the course";
  }

  const invalidLesson = lessons.find(
    (lesson) =>
      !lesson.title ||
      !lesson.videoUrl ||
      !lesson.duration ||
      !lesson.description ||
      !extractYouTubeVideoId(lesson.videoUrl)
  );

  if (invalidLesson) {
    return "Each lesson must include a valid YouTube link, title, duration, and description";
  }

  return "";
};

const canManageCourse = (course, req) => {
  if (req.admin) {
    return true;
  }

  return Boolean(req.user?._id && course.createdBy === req.user._id.toString());
};

const enrichCoursesWithLessonCounts = async (courses) => {
  const courseIds = courses.map((course) => course._id);
  const counts = await CourseLesson.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: "$courseId", total: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((item) => [item._id.toString(), item.total]));

  return Promise.all(
    courses.map(async (course) =>
      formatCourseSummary(
        course,
        countMap.get(course._id.toString()) || 0,
        await getCreatorDetails(course)
      )
    )
  );
};

export const createCourse = async (req, res) => {
  try {
    const actor = getActorIdentity(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create a course",
      });
    }

    const lessons = normalizeLessons(req.body.lessons);
    const coursePayload = {
      title: String(req.body.title || "").trim(),
      description: String(req.body.description || "").trim(),
      instructor: String(req.body.instructor || "").trim(),
      duration: String(req.body.duration || "").trim(),
      level: String(req.body.level || "").trim(),
      category: String(req.body.category || "").trim(),
      lessons,
    };

    const validationMessage = validateCoursePayload(coursePayload);
    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const isAdminPost = actor.role === "admin";

    const course = await Course.create({
      title: coursePayload.title,
      description: coursePayload.description,
      instructor: coursePayload.instructor,
      duration: coursePayload.duration,
      level: coursePayload.level,
      category: coursePayload.category,
      image: buildImagePath(req.file),
      createdBy: actor.id,
      creatorRole: actor.role,
      status: isAdminPost ? "approved" : "pending",
      reviewedBy: isAdminPost ? actor.id : null,
      isAdminPost,
    });

    await CourseLesson.insertMany(
      lessons.map((lesson) => ({
        ...lesson,
        courseId: course._id,
      }))
    );

    return res.status(201).json({
      success: true,
      message: isAdminPost ? "Course created successfully" : "Course submitted for approval",
      item: course,
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

export const getPublicCourses = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0;
    const query = Course.find({ status: "approved" }).sort({ createdAt: -1 });

    if (limit > 0) {
      query.limit(limit);
    }

    const courses = await query;
    const items = await enrichCoursesWithLessonCounts(courses);

    return res.status(200).json({
      success: true,
      items,
      courses: items,
    });
  } catch (error) {
    console.error("Get Public Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const getPublicCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findOne({ _id: id, status: "approved" });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const [lessons, comments, relatedCourses] = await Promise.all([
      CourseLesson.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 }),
      CourseComment.find({ courseId: course._id })
        .populate("userId", "username profileImage")
        .sort({ createdAt: -1 }),
      Course.find({
        _id: { $ne: course._id },
        status: "approved",
        category: course.category,
      })
        .sort({ createdAt: -1 })
        .limit(3),
    ]);

    const creatorDetails = await getCreatorDetails(course);

    const serializedCourse = {
      ...formatCourseSummary(course, lessons.length, creatorDetails),
      image: course.image || COURSE_FALLBACK_IMAGE,
      author: {
        _id: creatorDetails.createdBy || null,
        username: creatorDetails.creatorName || "NAVAVERSE Creator",
        profileImage: creatorDetails.creatorProfileImage || "",
      },
      lessons: lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        videoId: extractYouTubeVideoId(lesson.videoUrl),
        duration: lesson.duration,
        description: lesson.description,
        order: lesson.order,
      })),
      comments: comments.map((comment) => ({
        _id: comment._id,
        message: comment.message,
        createdAt: comment.createdAt,
        user: {
          _id: comment.userId?._id || null,
          username: comment.userId?.username || "NAVAVERSE User",
          profileImage: comment.userId?.profileImage || "",
        },
      })),
      relatedCourses: await Promise.all(
        relatedCourses.map(async (relatedCourse) =>
          formatCourseSummary(relatedCourse, 0, await getCreatorDetails(relatedCourse))
        )
      ),
    };

    return res.status(200).json({
      success: true,
      item: serializedCourse,
      course: serializedCourse,
    });
  } catch (error) {
    console.error("Get Public Course By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
    });
  }
};

export const getUserCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      createdBy: req.user._id.toString(),
      creatorRole: "user",
    }).sort({ createdAt: -1 });

    const items = await enrichCoursesWithLessonCounts(courses);

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get User Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your courses",
    });
  }
};

export const getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    const items = await enrichCoursesWithLessonCounts(courses);

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get Admin Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "pending" }).sort({ createdAt: -1 });

    const items = await enrichCoursesWithLessonCounts(courses);

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get Pending Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending courses",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = getActorIdentity(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageCourse(course, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const lessons = normalizeLessons(req.body.lessons);
    const coursePayload = {
      title: String(req.body.title || "").trim(),
      description: String(req.body.description || "").trim(),
      instructor: String(req.body.instructor || "").trim(),
      duration: String(req.body.duration || "").trim(),
      level: String(req.body.level || "").trim(),
      category: String(req.body.category || "").trim(),
      lessons: lessons.length ? lessons : await CourseLesson.find({ courseId: course._id }).sort({ order: 1 }),
    };

    const validationMessage = validateCoursePayload(coursePayload);
    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    course.title = coursePayload.title;
    course.description = coursePayload.description;
    course.instructor = coursePayload.instructor;
    course.duration = coursePayload.duration;
    course.level = coursePayload.level;
    course.category = coursePayload.category;

    if (req.file) {
      course.image = buildImagePath(req.file);
    }

    if (req.admin) {
      course.createdBy = actor.id;
      course.creatorRole = "admin";
      course.status = "approved";
      course.reviewedBy = actor.id;
      course.rejectionReason = "";
      course.isAdminPost = true;
    } else {
      course.createdBy = actor.id;
      course.creatorRole = "user";
      course.status = "pending";
      course.reviewedBy = null;
      course.rejectionReason = "";
      course.isAdminPost = false;
    }

    await course.save();

    if (lessons.length) {
      await CourseLesson.deleteMany({ courseId: course._id });
      await CourseLesson.insertMany(
        lessons.map((lesson) => ({
          ...lesson,
          courseId: course._id,
        }))
      );
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      item: course,
      course,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageCourse(course, req)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    await Promise.all([
      Course.findByIdAndDelete(id),
      CourseLesson.deleteMany({ courseId: id }),
      CourseComment.deleteMany({ courseId: id }),
      CourseEnrollment.deleteMany({ courseId: id }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

export const approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        reviewedBy: req.admin.id,
        rejectionReason: "",
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course approved successfully",
      item: course,
      course,
    });
  } catch (error) {
    console.error("Approve Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve course",
    });
  }
};

export const rejectCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        reviewedBy: req.admin.id,
        rejectionReason: req.body.rejectionReason || "",
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course rejected successfully",
      item: course,
      course,
    });
  } catch (error) {
    console.error("Reject Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject course",
    });
  }
};

export const getCourseComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const comments = await CourseComment.find({ courseId: id })
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments: comments.map((comment) => ({
        _id: comment._id,
        message: comment.message,
        createdAt: comment.createdAt,
        user: {
          _id: comment.userId?._id || null,
          username: comment.userId?.username || "NAVAVERSE User",
          profileImage: comment.userId?.profileImage || "",
        },
      })),
    });
  } catch (error) {
    console.error("Get Course Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

export const createCourseComment = async (req, res) => {
  try {
    const { id } = req.params;
    const message = String(req.body.message || "").trim();

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Comment message is required",
      });
    }

    const course = await Course.findOne({ _id: id, status: "approved" });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const comment = await CourseComment.create({
      courseId: id,
      userId: req.user._id,
      message,
    });

    await comment.populate("userId", "username profileImage");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: {
        _id: comment._id,
        message: comment.message,
        createdAt: comment.createdAt,
        user: {
          _id: comment.userId?._id || null,
          username: comment.userId?.username || "NAVAVERSE User",
          profileImage: comment.userId?.profileImage || "",
        },
      },
    });
  } catch (error) {
    console.error("Create Course Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findOne({ _id: courseId, status: "approved" });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrollment = await CourseEnrollment.create({
      courseId,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    const message =
      error.code === 11000 ? "You are already enrolled in this course" : "Failed to enroll";

    return res.status(500).json({
      success: false,
      message,
    });
  }
};
