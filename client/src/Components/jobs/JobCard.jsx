import { assetUrl } from "../../api/axios";
import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, MapPin, Wallet, Clock3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const fallbackImage =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop";

const buildImageUrl = (path) => {
  if (!path) return fallbackImage;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return assetUrl(encodeURI(path));
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const imageUrl = buildImageUrl(job?.companyLogo);
  const tags = [job?.category, job?.jobType].filter(Boolean).slice(0, 2);
  const description = job?.description?.length > 150
    ? `${job.description.slice(0, 150)}...`
    : job?.description || "Explore a new opportunity inside the NAVAVERSE ecosystem.";

  const handleClick = () => {
    navigate(`/jobs/${job._id}`);
  };

  return (
    <div
      className="blog-card job-card"
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="blog-image job-image">
        <img
          src={imageUrl}
          alt={job?.title || "Job Image"}
          loading="lazy"
          decoding="async"
          width="1200"
          height="720"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />

        {tags.length ? (
            <div className="blog-tags job-tags">
              {tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="blog-tag job-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="blog-card-content job-card-content">
        <div className="job-card-copy">
          <div className="job-card-top">
            <div className="job-author-block">
              <div className="job-author-fallback" aria-hidden="true">
                <BriefcaseBusiness size={16} />
              </div>

              <span className="job-author-link static-author">
                {job?.companyName || "NAVAVERSE Partner"}
              </span>
            </div>
            <span className="job-card-location-pill blog-tag">
              <MapPin size={13} />
              {job?.location || "Remote"}
            </span>
          </div>

          <h3>{job?.title}</h3>
          <p className="job-card-description">{description}</p>

          <div className="job-detail-chips">
            <span className="job-detail-chip blog-tag">
              <Clock3 size={13} />
              {job?.jobType || "Full Time"}
            </span>
            <span className="job-detail-chip blog-tag">
              <Wallet size={13} />
              {job?.salary || "Salary not disclosed"}
            </span>
          </div>
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

        <div className="job-card-footer">
          <div className="job-meta">
            <span>{job?.experience || "Open to all levels"}</span>
          </div>

          <Link
            to={`/jobs/${job._id}`}
            className="job-view-btn card-access-link"
            onClick={(event) => event.stopPropagation()}
          >
            {isAuthenticated ? "View Details" : "Preview"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default memo(JobCard);


