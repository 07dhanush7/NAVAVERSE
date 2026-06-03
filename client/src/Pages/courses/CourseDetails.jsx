import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import CourseCard from "../../Components/courses/CourseCard";
import axios, { assetUrl } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toYouTubeEmbedUrl } from "../../utils/youtube";
import AuthPrompt from "../../Components/common/AuthPrompt";
const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Course";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/courses/public/${id}`);
        const nextCourse = data.item || data.course || null;
        setCourse(nextCourse);
        setActiveLessonIndex(0);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const activeLesson = course?.lessons?.[activeLessonIndex] || null;
  const embedUrl = activeLesson ? toYouTubeEmbedUrl(activeLesson.videoUrl) : "";

  const lessonMeta = useMemo(
    () => [
      `Instructor: ${course?.instructor || "NAVAVERSE"}`,
      course?.duration || "Self-paced",
      course?.level || "Beginner",
      course?.category || "General",
    ],
    [course]
  );

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmittingComment(true);
      const { data } = await axios.post(`/courses/${id}/comments`, {
        message: commentText,
      });

      setCourse((current) =>
        current
          ? {
              ...current,
              comments: [data.comment, ...(current.comments || [])],
            }
          : current
      );
      setCommentText("");
      toast.success(data.message || "Comment added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (authLoading || loading) {
    return <div className="modern-loader" />;
  }

  if (!course) {
    return <div className="modern-loader">Course not found</div>;
  }

  const createdAt = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently added";

  const heroImage = course.image?.startsWith("http")
    ? course.image
    : course.image
      ? assetUrl(course.image)
      : fallbackImage;

  const lessonCount = course.lessons?.length || 0;
  const showProtectedContent = Boolean(user);
  const learnItems = [
    `Master ${course.category || "core concepts"} through ${lessonCount} structured video lessons.`,
    `Build confidence at the ${course.level || "Beginner"} level with creator-led instruction.`,
    `Follow a practical path taught by ${course.instructor || "the NAVAVERSE team"}.`,
  ];
  const requirementItems = [
    "A stable internet connection for YouTube-based lessons.",
    `Time commitment: ${course.duration || "Self-paced"}.`,
    `Best suited for ${course.level || "Beginner"} learners.`,
  ];

  return (
    <div className="modern-wrapper course-details-page">
      <Navbar />

      <section className="startup-hero course-hero">
        <img src={heroImage} alt={course.title} />
        <div className="startup-hero-overlay">
          <div className="startup-hero-content">
            <p className="startup-hero-status">{course.level}</p>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="blog-meta startup-hero-meta">
              {lessonMeta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="blog-container startup-container course-detail-container">
        <main>
          <article className="modern-card startup-detail-card course-detail-card">
            <div className="modern-header">
              <h1>{course.title}</h1>
              <div className="blog-meta">
                <span>{course.instructor}</span>
                <span>&bull;</span>
                <span>{createdAt}</span>
                <span>&bull;</span>
                <span>{lessonCount} lessons</span>
              </div>
            </div>

            <section className="course-video-shell">
              {showProtectedContent && embedUrl ? (
                <div className="course-video-frame">
                  <iframe
                    src={embedUrl}
                    title={activeLesson?.title || course.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : !showProtectedContent ? (
                <div className="course-video-empty">
                  <p>Please login to access full content</p>
                  <AuthPrompt compact description="Login to watch the lessons and unlock the full course curriculum." />
                </div>
              ) : (
                <div className="course-video-empty">The selected lesson video could not be loaded.</div>
              )}
            </section>

            <section className="course-content-layout">
              <div className="course-content-main">
                <section className="startup-info-block">
                  <h3>Course Description</h3>
                  <p>{course.description}</p>
                </section>

                <section className="startup-info-block">
                  <h3>What you'll learn</h3>
                  <ul className="course-bullet-list">
                    {learnItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="startup-info-block">
                  <h3>Requirements</h3>
                  <ul className="course-bullet-list">
                    {requirementItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                {activeLesson ? (
                  <section className="startup-info-block">
                    <h3>Current Lesson</h3>
                    <p>
                      {showProtectedContent
                        ? activeLesson.description
                        : "Please login to access full content"}
                    </p>
                  </section>
                ) : null}
              </div>

              <aside className="sidebar startup-sidebar course-lessons-sidebar">
                <div className="sidebar-card">
                  <div className="sidebar-card-header">
                    <h3>Lesson List</h3>
                  </div>

                  <div className="course-lesson-sidebar-list">
                    {course.lessons?.length ? (
                      course.lessons.map((lesson, index) => (
                        <button
                          key={lesson._id}
                          type="button"
                          className={`course-lesson-item ${index === activeLessonIndex ? "active" : ""}`}
                          onClick={() => setActiveLessonIndex(index)}
                          disabled={!showProtectedContent}
                        >
                          <strong>{lesson.title}</strong>
                          <span>{showProtectedContent ? lesson.duration : "Locked"}</span>
                        </button>
                      ))
                    ) : (
                      <div className="sidebar-empty">No lessons available for this course yet.</div>
                    )}
                  </div>
                </div>
              </aside>
            </section>

            <section className="comments">
              <div className="modern-comments">
                <h3>Comments ({course.comments?.length || 0})</h3>

                {user ? (
                  <form onSubmit={handleCommentSubmit} className="modern-comment-form">
                    <textarea
                      placeholder="Share what you think about this course"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                    />
                    <button type="submit" disabled={submittingComment}>
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </form>
                ) : (
                  <AuthPrompt compact description="Login to comment and continue learning from this course." />
                )}

                <div className="modern-comment-list">
                  {course.comments?.length ? (
                    course.comments.map((comment) => (
                      <div key={comment._id} className="modern-comment">
                        <Link to={`/profile/${comment.user?._id}`}>
                          <img
                            src={
                              comment.user?.profileImage
                                ? assetUrl(comment.user.profileImage)
                                : "https://i.imgur.com/6VBx3io.png"
                            }
                            alt={comment.user?.username || "User"}
                          />
                        </Link>

                        <div className="modern-comment-body">
                          <div className="comment-top">
                            <Link to={`/profile/${comment.user?._id}`}>
                              <strong>{comment.user?.username || "NAVAVERSE User"}</strong>
                            </Link>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{comment.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="modern-login-box">No comments yet.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="startup-info-block course-related-section">
              <div className="sidebar-card-header">
                <h3>Related Courses</h3>
              </div>

              {course.relatedCourses?.length ? (
                <div className="course-related-grid">
                  {course.relatedCourses.map((relatedCourse) => (
                    <CourseCard key={relatedCourse._id} course={relatedCourse} />
                  ))}
                </div>
              ) : (
                <div className="modern-login-box">No related courses available yet.</div>
              )}
            </section>
          </article>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;


