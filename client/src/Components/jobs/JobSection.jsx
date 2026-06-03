import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import axios, { assetUrl } from "../../api/axios";
const jobFallbackImage =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop";

const buildImageUrl = (path, fallback) => {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return assetUrl(encodeURI(path));
};

const JobSection = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("/jobs");

        if (data.success) {
          setJobs((data.jobs || []).slice(0, 3));
        }
      } catch (error) {
        console.error("Job fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <div className="jobs-loading">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return null;
  }

  const buildJobSummary = (job) => {
    if (job?.description) return job.description;
    if (job?.skills?.length) return `Skills: ${job.skills.slice(0, 3).join(", ")}`;
    return "Explore the role, growth path, team expectations, and application details for this opportunity.";
  };

  return (
    <section className="job-landing-section">
      <div className="job-landing-title-box">
        <h2>Latest Tech Opportunities</h2>

        <p className="job-landing-desc">
          Discover exciting opportunities from innovative startups and leading tech companies.
        </p>

        <Link to="/jobs" className="job-landing-see-all">
          View All Jobs -&gt;
        </Link>
      </div>

      <div className="job-landing-grid">
        {jobs.map((job) => {
          const imageUrl = buildImageUrl(job.companyLogo, jobFallbackImage);
          const companyName = job.companyName || "NAVAVERSE Partner";
          const tags = [job.location, job.experienceLevel, job.jobType]
            .filter(Boolean)
            .slice(0, 2);

          return (
            <div
              key={job._id}
              className="blog-card"
              onClick={() => navigate(`/jobs/${job._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/jobs/${job._id}`);
                }
              }}
            >
              <div className="blog-image">
                <img
                  src={imageUrl}
                  alt={job.title || "Job"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = jobFallbackImage;
                  }}
                />

                {tags.length ? (
                  <div className="blog-tags">
                    {tags.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="blog-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="blog-card-content">
                <div className="job-card-copy">
                  <h3>{job.title}</h3>
                  <p>{buildJobSummary(job)}</p>
                </div>

                <div className="blog-card-footer">
                  <div className="blog-author-block">
                    <div className="blog-author-fallback" aria-hidden="true">
                      <BriefcaseBusiness size={16} />
                    </div>
                    <span className="blog-author-link static-author">{companyName}</span>
                  </div>

                  <div className="blog-meta">
                    <span>{job.location || "Remote"}</span>
                    <span>&bull;</span>
                    <span>{job.jobType || "Full Time"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default JobSection;



