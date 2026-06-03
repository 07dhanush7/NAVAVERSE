import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import StartupCard from "../../Components/startups/StartupCard";
import axios, { assetUrl } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import AuthPrompt from "../../Components/common/AuthPrompt";
const collaborationRoles = ["Developer", "Designer", "Marketer", "Investor"];
const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Startup";

const StartupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingCollaboration, setSubmittingCollaboration] = useState(false);
  const [collaborationForm, setCollaborationForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    role: "Developer",
    skills: "",
    message: "",
  });

  useEffect(() => {
    setCollaborationForm((current) => ({
      ...current,
      name: user?.username || current.name,
      email: user?.email || current.email,
    }));
  }, [user?.email, user?.username]);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/startups/public/${id}`);
        setStartup(data.item);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load startup");
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [id]);

  const handleProtectedAction = (callback) => {
    if (!user) {
      navigate("/login");
      return;
    }
    callback();
  };

  const handleLike = async () => {
    handleProtectedAction(async () => {
      try {
        const { data } = await axios.post(`/startups/${id}/like`);
        setStartup((current) =>
          current ? { ...current, liked: data.liked, totalLikes: data.totalLikes } : current
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update like");
      }
    });
  };

  const handleSave = async () => {
    handleProtectedAction(async () => {
      try {
        const { data } = await axios.post(`/startups/${id}/save`);
        setStartup((current) => (current ? { ...current, saved: data.saved } : current));
        toast.success(data.saved ? "Startup saved" : "Startup removed from saved");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update save");
      }
    });
  };

  const handleRate = async (ratingValue) => {
    handleProtectedAction(async () => {
      try {
        const { data } = await axios.post(`/startups/${id}/rate`, { rating: ratingValue });
        setStartup((current) =>
          current
            ? {
                ...current,
                currentRating: ratingValue,
                averageRating: data.averageRating,
                totalRatings: data.totalRatings,
              }
            : current
        );
        toast.success(data.message || "Rating added successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to rate startup");
      }
    });
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    handleProtectedAction(async () => {
      if (!commentText.trim()) {
        return;
      }

      try {
        setSubmittingComment(true);
        const { data } = await axios.post(`/startups/${id}/comments`, {
          message: commentText,
        });

        setStartup((current) =>
          current
            ? {
                ...current,
                comments: [data.discussion, ...(current.comments || [])],
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
    });
  };

  const handleCollaborationSubmit = async (event) => {
    event.preventDefault();

    handleProtectedAction(async () => {
      try {
        setSubmittingCollaboration(true);
        const { data } = await axios.post(`/startups/${id}/collaborate`, collaborationForm);
        setStartup((current) => (current ? { ...current, hasApplied: true } : current));
        toast.success(data.message || "Collaboration request sent successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send collaboration request");
      } finally {
        setSubmittingCollaboration(false);
      }
    });
  };

  const actionButtons = startup
    ? [
        {
          key: "like",
          label: startup.liked ? `Liked (${startup.totalLikes || 0})` : `Like (${startup.totalLikes || 0})`,
          onClick: handleLike,
          active: startup.liked,
        },
        {
          key: "save",
          label: startup.saved ? "Saved" : "Save",
          onClick: handleSave,
          active: startup.saved,
        },
      ]
    : [];

  if (authLoading || loading) {
    return <div className="modern-loader" />;
  }

  if (!startup) {
    return <div className="modern-loader">Startup not found</div>;
  }

  const heroImage = startup.startupImage || startup.imageUrl || fallbackImage;
  const metaItems = [startup.category, startup.stage, startup.location].filter(Boolean);
  const showProtectedContent = Boolean(user);
  const showCollaborateButton = user && user._id !== startup.createdBy && startup.status === "Approved";

  return (
    <div className="modern-wrapper startup-details-page">
      <Navbar />

      <section className="startup-hero">
        <img src={heroImage} alt={startup.title} />
        <div className="startup-hero-overlay">
          <div className="startup-hero-content">
            <p className="startup-hero-status">{startup.status}</p>
            <h1>{startup.title}</h1>
            <p>{startup.tagline || startup.description}</p>
            <div className="blog-meta startup-hero-meta">
              {metaItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="blog-container startup-container">
        <main>
          <article className="modern-card startup-detail-card">
            <div className="modern-header">
              <h1>{startup.title}</h1>
              <div className="blog-meta">
                <span>Founder: {startup.founderName || startup.creatorName}</span>
                <span>&bull;</span>
                <span>{new Date(startup.createdAt).toLocaleDateString()}</span>
                <span>&bull;</span>
                <span>{startup.totalRatings || 0} ratings</span>
              </div>
            </div>

            <div className="startup-detail-sections">
              <section className="startup-info-block">
                <h3>Description</h3>
                <p>{startup.description}</p>
              </section>

              <section className="startup-info-block">
                <h3>Problem</h3>
                <p>
                  {showProtectedContent
                    ? startup.problem || "The founder has not added the problem statement yet."
                    : "Please login to access full content"}
                </p>
              </section>

              <section className="startup-info-block">
                <h3>Solution</h3>
                <p>
                  {showProtectedContent
                    ? startup.solution || "The solution summary will appear here after the next update."
                    : "Please login to access full content"}
                </p>
              </section>

              <section className="startup-info-block">
                <h3>Vision</h3>
                <p>
                  {showProtectedContent
                    ? startup.vision || "The long-term vision will appear here after the next update."
                    : "Please login to access full content"}
                </p>
              </section>
            </div>

            <section className="blog-actions startup-actions">
              <div className="startup-action-grid">
                {actionButtons.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    className={`startup-action-btn startup-action-${action.key}${
                      action.active ? " is-active" : ""
                    }`}
                    onClick={action.onClick}
                  >
                    {action.key === "like" ? "" : ""} {action.label}
                  </button>
                ))}

                {showCollaborateButton ? (
                  <button
                    type="button"
                    className="startup-action-btn startup-collab-btn"
                    onClick={() =>
                      document.getElementById("startup-collaboration-form")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    disabled={startup.hasApplied}
                  >
                     {startup.hasApplied ? "Already Applied" : "Collaborate"}
                  </button>
                ) : startup.status === "Pending" ? (
                  <span className="startup-under-review">Under Review</span>
                ) : null}
              </div>
            </section>

            <section className="blog-actions startup-actions">
              <div className="modern-actions-section startup-rating-header">
                <div className="modern-like-section">
                  <span className="startup-rating-copy">
                    Average rating: {startup.averageRating || 0} / 5 from {startup.totalRatings || 0} users
                  </span>
                </div>
                <div className="modern-rating-section">
                  <p>Rate this startup</p>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={value <= (hoverRating || startup.currentRating || 0) ? "on" : "off"}
                        onClick={() => handleRate(value)}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={Boolean(startup.currentRating)}
                      >
                        <span className="star">&#9733;</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {showCollaborateButton ? (
              <section
                id="startup-collaboration-form"
                className="modern-comments startup-collaboration-section"
              >
                <h3>Collaborate with this startup</h3>
                <form className="startup-collaboration-form" onSubmit={handleCollaborationSubmit}>
                  <div className="startup-form-grid">
                    <input
                      type="text"
                      placeholder="Name"
                      value={collaborationForm.name}
                      onChange={(event) =>
                        setCollaborationForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={collaborationForm.email}
                      onChange={(event) =>
                        setCollaborationForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                    <select
                      value={collaborationForm.role}
                      onChange={(event) =>
                        setCollaborationForm((current) => ({ ...current, role: event.target.value }))
                      }
                    >
                      {collaborationRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Skills"
                      value={collaborationForm.skills}
                      onChange={(event) =>
                        setCollaborationForm((current) => ({ ...current, skills: event.target.value }))
                      }
                    />
                  </div>

                  <textarea
                    rows="5"
                    placeholder="Tell the founder why you want to collaborate"
                    value={collaborationForm.message}
                    onChange={(event) =>
                      setCollaborationForm((current) => ({ ...current, message: event.target.value }))
                    }
                  />

                  <button type="submit" disabled={submittingCollaboration || startup.hasApplied}>
                    {startup.hasApplied
                      ? "Already Applied"
                      : submittingCollaboration
                        ? "Sending..."
                        : "Send Collaboration Request"}
                  </button>
                </form>
              </section>
            ) : !showProtectedContent ? (
              <section className="modern-comments startup-collaboration-section">
                <h3>Collaborate with this startup</h3>
                <AuthPrompt compact description="Login to collaborate, save this startup, and unlock the full founder details." />
              </section>
            ) : null}

            <section className="comments">
              <div className="modern-comments">
                <h3>Comments ({startup.comments?.length || 0})</h3>

                {user ? (
                  <form onSubmit={handleCommentSubmit} className="modern-comment-form">
                    <textarea
                      placeholder="Add your comment"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                    />
                    <button type="submit" disabled={submittingComment}>
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </form>
                ) : (
                  <AuthPrompt compact description="Login to comment and interact with this startup." />
                )}

                <div className="modern-comment-list">
                  {startup.comments?.length ? (
                    startup.comments.map((comment) => (
                      <div key={comment._id} className="modern-comment">
                        <Link to={`/profile/${comment.userId?._id}`}>
                          <img
                            src={
                              comment.userId?.profileImage
                                ? assetUrl(comment.userId.profileImage)
                                : "https://i.imgur.com/6VBx3io.png"
                            }
                            alt={comment.userId?.username || "User"}
                          />
                        </Link>

                        <div className="modern-comment-body">
                          <div className="comment-top">
                            <Link to={`/profile/${comment.userId?._id}`}>
                              <strong>{comment.userId?.username || "NAVAVERSE User"}</strong>
                            </Link>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{comment.text || comment.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="modern-login-box">No comments yet.</div>
                  )}
                </div>
              </div>
            </section>
          </article>
        </main>

        <aside className="sidebar startup-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Founder Info</h3>
            </div>
            <div className="category-list">
              <div className="category-item">
                <span>Name</span>
                <span>{startup.founderName || startup.creatorName}</span>
              </div>
              <div className="category-item">
                <span>Stage</span>
                <span>{startup.stage}</span>
              </div>
              <div className="category-item">
                <span>Location</span>
                <span>{startup.location || "Remote"}</span>
              </div>
              <div className="category-item">
                <span>Contact</span>
                <span>{startup.contactEmail}</span>
              </div>
            </div>

            <div className="startup-sidebar-actions">
              {startup.website ? (
                <a href={startup.website} target="_blank" rel="noreferrer" className="startup-sidebar-link">
                  Visit Website
                </a>
              ) : null}

              {showCollaborateButton ? (
                <button
                  type="button"
                  className="startup-sidebar-link startup-sidebar-button"
                  onClick={() =>
                    document.getElementById("startup-collaboration-form")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  disabled={startup.hasApplied}
                >
                  {startup.hasApplied ? "Already Applied" : "Collaborate"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Related Startups</h3>
            </div>

            <div className="startup-related-list">
              {startup.relatedStartups?.length ? (
                startup.relatedStartups.slice(0, 4).map((related) => (
                  <StartupCard key={related._id} startup={related} />
                ))
              ) : (
                <div className="sidebar-empty">No related startups available yet.</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default StartupDetails;


