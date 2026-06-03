import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Startup";

const StartupCard = ({ startup }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const imageUrl = startup?.startupImage || startup?.imageUrl || fallbackImage;
  const tags = Array.isArray(startup?.tags) && startup.tags.length
    ? startup.tags.slice(0, 3)
    : [startup?.category, startup?.stage].filter(Boolean);

  const startupDate = startup?.createdAt
    ? new Date(startup.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const excerpt = isAuthenticated
    ? startup?.description?.length > 120
      ? `${startup.description.slice(0, 120)}...`
      : startup?.description || "Discover the next startup being built inside NAVAVERSE."
    : "Please login to access full content";

  return (
    <article
      className="blog-card startup-card"
      onClick={() => navigate(`/startups/${startup._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/startups/${startup._id}`);
        }
      }}
    >
      <div className="blog-image startup-card-image">
        <img
          src={imageUrl}
          alt={startup?.title || "Startup"}
          loading="lazy"
          decoding="async"
          width="1200"
          height="720"
        />

        {tags.length ? (
          <div className="blog-tags">
            {tags.map((tag) => (
              <span key={tag} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="blog-card-content">
        <div className="startup-card-top">
          <h3>{startup?.title}</h3>
          <p>{excerpt}</p>
        </div>

        {!isAuthenticated ? (
          <div className="card-access-note">
            <span>Please login to access full content</span>
            <Link
              to="/login"
              className="card-access-link"
              onClick={(event) => event.stopPropagation()}
            >
              Login
            </Link>
          </div>
        ) : null}

        <div className="startup-card-details">
          <span>Founder: {startup?.founderName || startup?.creatorName || "NAVAVERSE"}</span>
          <span>{startup?.location || "Remote friendly"}</span>
        </div>

        <div className="blog-card-footer startup-card-footer">
          <div className="blog-meta">
            <span>{startupDate || "Recently added"}</span>
            <span>&bull;</span>
            <span>{startup?.stage || "Idea"}</span>
          </div>

          <Link
            to={`/startups/${startup._id}`}
            className="startup-view-btn card-access-link"
            onClick={(event) => event.stopPropagation()}
          >
            {isAuthenticated ? "View Details" : "Preview"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default memo(StartupCard);


