import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios, { assetUrl } from "../../api/axios";
import { blogCategories } from "../../assets/assets";
import Navbar from "@/Components/common/Navbar";
import Footer from "@/Components/common/Footer";
import AuthPrompt from "@/Components/common/AuthPrompt";
import { sanitizeArticleHtml, stripHtml } from "../../utils/blogContent";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [allBlogs, setAllBlogs] = useState([]);

  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiInsights = async () => {
    if (!blog) return;
    try {
      setAiLoading(true);
      const { data } = await axios.post("/ai/blog-insights", {
        blogTitle: blog.title,
        blogContent: blog.description,
      });

      if (data.success) {
        setAiInsights({
          summary: data.summary,
          suggestions: data.suggestions,
        });
      }
    } catch (error) {
      console.error("AI Insights fetch error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);

        const [blogRes, commentRes] = await Promise.all([
          axios.get(`/blog/${id}`),
          axios.get(`/comments/${id}`),
        ]);

        const fetchedBlog = blogRes.data.blog;
        setBlog(fetchedBlog);
        setLikes(fetchedBlog?.likes?.length || 0);
        setComments(commentRes.data.comments || []);

        if (user && fetchedBlog?.ratings) {
          const userRating = fetchedBlog.ratings.find(
            (r) => r.user.toString() === user._id.toString()
          );
          if (userRating) setRating(userRating.rating);
        }
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  useEffect(() => {
    const loadSidebarBlogs = async () => {
      try {
        const { data } = await axios.get("/blog");
        setAllBlogs(Array.isArray(data?.blogs) ? data.blogs : []);
      } catch (error) {
        console.error("Sidebar blog fetch error:", error);
      }
    };

    loadSidebarBlogs();
  }, []);

  const handleRating = async (val) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setRating(val);
      await axios.put(`/blog/rate/${id}`, { rating: val });
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  useEffect(() => {
    if (user && blog?.likes) {
      const isLiked = blog.likes.some(
        (likeUserId) => likeUserId.toString() === user._id.toString()
      );
      setLiked(isLiked);
    } else {
      setLiked(false);
    }
  }, [user, blog]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.put(`/blog/like/${id}`);
      setLikes(data.totalLikes);
      setLiked(data.liked);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!content.trim()) return;

    try {
      await axios.post(`/comments/${id}`, { content });
      setContent("");

      const { data } = await axios.get(`/comments/${id}`);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  if (authLoading || pageLoading) {
    return <div className="modern-loader"></div>;
  }

  if (!blog) {
    return <div className="error-state">Blog not found</div>;
  }

  const blogDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const readTime = blog?.readTime || "5 min read";
  const authorName = blog?.authorName || blog?.creator?.username || "NAVAVERSE";
  const articleHtml = sanitizeArticleHtml(blog.description || "");
  const previewText = stripHtml(articleHtml).slice(0, 360);
  const previewHtml = `<p>${previewText}${previewText.length >= 360 ? "..." : ""}</p>`;
  const relatedBlogs = allBlogs
    .filter(
      (item) =>
        item?._id !== blog?._id &&
        item?.category &&
        blog?.category &&
        item.category === blog.category
    )
    .slice(0, 3);
  const recentPosts = allBlogs
    .filter((item) => item?._id !== blog?._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);
  const categoryCounts = allBlogs.reduce((acc, item) => {
    if (item?.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="modern-wrapper">
      <Navbar />

      <div className="blog-container">
        <main className="modern-card">
          <img
            className="blog-image-detail"
            src={
              blog.image
                ? assetUrl(blog.image)
                : "https://via.placeholder.com/1200x600"
            }
            alt={blog.title}
          />

          <div className="modern-header">
            <h1>{blog.title}</h1>
            <div className="blog-meta">
              <span>{authorName}</span>
              <span>&bull;</span>
              <span>{blogDate}</span>
              <span>&bull;</span>
              <span>{readTime}</span>
            </div>
          </div>

          {user ? (
            <div
              className="modern-content"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          ) : (
            <section className="detail-gated-block">
              <div
                className="modern-content detail-gated-preview"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
              <AuthPrompt compact />
            </section>
          )}

          <div className="blog-actions">
            <div className="modern-actions-section">
              <div className="modern-like-section">
                <button
                  className={`modern-heart ${liked ? "liked" : ""}`}
                  onClick={handleLike}
                >
                  &#9829;
                </button>
                <span>
                  {likes} {likes === 1 ? "Like" : "Likes"}
                </span>
              </div>

              <div className="modern-rating-section">
                <p>Rate this blog:</p>
                <div className="star-rating">
                  {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={index}
                        className={ratingValue <= (hover || rating) ? "on" : "off"}
                        onClick={() => handleRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(rating)}
                      >
                        <span className="star">&#9733;</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modern-ai-section">
              {user ? (
                <>
                  <div className="ai-header">
                    <button
                      onClick={handleAiInsights}
                      disabled={aiLoading}
                      className="ai-gen-btn"
                    >
                      {aiLoading
                        ? "Thinking..."
                        : aiInsights
                          ? "Refresh Summary"
                          : "Generate Summary"}
                    </button>
                  </div>

                  {aiInsights && (
                    <div className="ai-content-box">
                      <div className="ai-summary">
                        <h4>Summary:</h4>
                        <p>{aiInsights.summary}</p>
                      </div>

                      <div className="ai-suggestions">
                        <h4>Suggested Comments:</h4>
                        <div className="suggestion-chips">
                          {aiInsights.suggestions.map((s, i) => (
                            <span
                              key={i}
                              className="suggestion-chip"
                              onClick={() => setContent(s)}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <AuthPrompt compact description="Login to generate summaries, like, rate, and comment on this blog." />
              )}
            </div>
          </div>

          <div className="comments">
            <div className="modern-comments">
              <h3>Discussion ({comments.length})</h3>

              {user ? (
                <form onSubmit={handleSubmit} className="modern-comment-form">
                  <textarea
                    placeholder="Share your thoughts..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <button type="submit">Post Comment</button>
                </form>
              ) : (
                <AuthPrompt compact description="Login to join the discussion on this blog." />
              )}

              <div className="modern-comment-list">
                {comments.map((comment) => (
                  <div key={comment._id} className="modern-comment">
                    <Link to={`/profile/${comment.user?._id}`}>
                      <img
                        src={
                          comment.user?.profileImage
                            ? assetUrl(comment.user.profileImage)
                            : "https://i.imgur.com/6VBx3io.png"
                        }
                        alt="avatar"
                      />
                    </Link>

                    <div className="modern-comment-body">
                      <div className="comment-top">
                        <Link to={`/profile/${comment.user?._id}`}>
                          <strong>{comment.user?.username}</strong>
                        </Link>
                        <span>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Related Blogs</h3>
            </div>
            <div className="sidebar-list">
              {relatedBlogs.length ? (
                relatedBlogs.map((item) => (
                  <Link key={item._id} to={`/blog/${item._id}`} className="sidebar-post">
                    <span className="sidebar-post-title">{item.title}</span>
                    <span className="sidebar-post-meta">
                      {item.category || "General"} &bull; {item.readTime || "5 min read"}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="sidebar-empty">No related blogs available yet.</div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Recent Posts</h3>
            </div>
            <div className="sidebar-list">
              {recentPosts.map((item) => (
                <Link key={item._id} to={`/blog/${item._id}`} className="sidebar-post">
                  <span className="sidebar-post-title">{item.title}</span>
                  <span className="sidebar-post-meta">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Categories</h3>
            </div>
            <div className="category-list">
              {blogCategories
                .filter((category) => category !== "All")
                .map((category) => (
                  <div key={category} className="category-item">
                    <span>{category}</span>
                    <span>{categoryCounts[category] || 0}</span>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetails;


