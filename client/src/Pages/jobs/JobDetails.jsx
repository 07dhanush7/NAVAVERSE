import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, MapPin, BriefcaseBusiness } from "lucide-react";
import axios, { assetUrl } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import AuthPrompt from "../../Components/common/AuthPrompt";
import JobCard from "../../Components/jobs/JobCard";
const fallbackImage =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop";

const buildImageUrl = (path) => {
  if (!path) return fallbackImage;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return assetUrl(encodeURI(path));
};

const splitToList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .replace(/.2022/g, ".")
      .split(/.|-.+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const deriveParagraphs = (text) =>
  String(text || "")
    .split(/.{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobRes, allJobsRes] = await Promise.all([axios.get(`/jobs/${id}`), axios.get("/jobs")]);

        const fetchedJob = jobRes.data.job;
        setJob(fetchedJob);
        setRelatedJobs(
          (allJobsRes.data.jobs || []).filter(
            (item) => item._id !== fetchedJob?._id && item.category === fetchedJob?.category
          )
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const skills = useMemo(() => splitToList(job?.skillsRequired || job?.skills), [job]);
  const descriptionParagraphs = useMemo(() => deriveParagraphs(job?.description), [job]);
  const responsibilities = useMemo(() => {
    const provided = splitToList(job?.responsibilities);
    if (provided.length) return provided;

    return descriptionParagraphs.slice(0, 3);
  }, [descriptionParagraphs, job]);
  const benefits = useMemo(() => {
    const provided = splitToList(job?.benefits);
    if (provided.length) return provided;

    return [
      "Opportunity to work on a meaningful NAVAVERSE-aligned role.",
      "A clear application flow with structured details and direct visibility.",
      "Room to grow with teams building in tech, government, and startup ecosystems.",
    ];
  }, [job]);

  const heroImage = buildImageUrl(job?.companyLogo);
  const deadline = job?.deadline || job?.applicationDeadline || "Rolling applications";
  const isOwnJob = user?._id && job?.createdBy && user._id === job.createdBy;
  const canAcceptApplications = job?.status === "approved" && Boolean(job?.createdBy);

  const handleApply = () => {
    navigate(`/jobs/apply/${id}`);
  };

  if (loading) {
    return <div className="job-loader">Loading...</div>;
  }

  if (!job) {
    return <div className="job-error">Job not found</div>;
  }

  return (
    <div className="job-detail-page">
      <Navbar />

      <main className="job-detail-main">
        <section className="job-detail-hero">
          <img src={heroImage} alt={job.companyName || job.title} className="job-detail-hero-image" />
          <div className="job-detail-hero-overlay">
            <div className="job-detail-hero-content">
              <p className="job-detail-eyebrow">{job.category || "Opportunity"}</p>
              <h1>{job.title}</h1>
              <div className="job-detail-hero-meta">
                <span>
                  <Building2 size={14} />
                  {job.companyName || "NAVAVERSE Partner"}
                </span>
                <span>
                  <MapPin size={14} />
                  {job.location || "Remote"}
                </span>
                <span>
                  <BriefcaseBusiness size={14} />
                  {job.jobType || "Full Time"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="job-detail-intro">
          <div>
            <p className="job-detail-kicker">Job Overview</p>
            <h2>{job.companyName || "NAVAVERSE Partner"}</h2>
            <p className="job-detail-intro-copy">
              {job.experience || "Open to all levels"} | {job.salary || "Salary not disclosed"}
            </p>
          </div>

          <div className="job-detail-inline-cta">
            {canAcceptApplications ? (
              isOwnJob ? (
                <span className="job-detail-note">You posted this job, so you cannot apply to it.</span>
              ) : (
                <button type="button" className="apply-btn" onClick={handleApply}>
                  Apply Now
                </button>
              )
            ) : (
              <span className="job-detail-note">This job is not accepting applications right now.</span>
            )}
          </div>
        </section>

        <div className="job-detail-layout">
          <main className="job-detail-main-card">
            <section className="job-detail-section">
              <h2>Full Job Description</h2>
              <div className="job-detail-richtext">
                {descriptionParagraphs.length ? (
                  descriptionParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>{job.description}</p>
                )}
              </div>
            </section>

            <section className="job-detail-section">
              <h2>Responsibilities</h2>
              {responsibilities.length ? (
                <ul className="job-detail-list">
                  {responsibilities.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="job-detail-empty-copy">Responsibilities were not listed separately.</p>
              )}
            </section>

            <section className="job-detail-section">
              <h2>Skills Required</h2>
              {skills.length ? (
                <div className="skills-list">
                  {skills.map((skill, index) => (
                    <span key={`${skill}-${index}`} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="job-detail-empty-copy">No separate skills list was provided.</p>
              )}
            </section>

            <section className="job-detail-section">
              <h2>Benefits</h2>
              <ul className="job-detail-list">
                {benefits.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="job-detail-actions">
              {!canAcceptApplications ? (
                <AuthPrompt compact description="Login to continue with the complete job application flow." />
              ) : isOwnJob ? (
                <p className="apply-note">You posted this job, so you cannot apply to it.</p>
              ) : (
                <button className="apply-btn" onClick={handleApply}>
                  Apply Now
                </button>
              )}
            </section>
          </main>

          <aside className="job-detail-sidebar">
            <div className="job-sidebar-card job-sidebar-sticky">
              <h3>Quick Info</h3>
              <div className="job-sidebar-list">
                <div className="job-sidebar-item">
                  <span>Company Name</span>
                  <strong>{job.companyName || "NAVAVERSE Partner"}</strong>
                </div>
                <div className="job-sidebar-item">
                  <span>Location</span>
                  <strong>{job.location || "Remote"}</strong>
                </div>
                <div className="job-sidebar-item">
                  <span>Salary</span>
                  <strong>{job.salary || "Salary not disclosed"}</strong>
                </div>
                <div className="job-sidebar-item">
                  <span>Job Type</span>
                  <strong>{job.jobType || "Full Time"}</strong>
                </div>
                <div className="job-sidebar-item">
                  <span>Deadline</span>
                  <strong>{deadline}</strong>
                </div>
              </div>

              {canAcceptApplications ? (
                isOwnJob ? (
                  <p className="apply-note sidebar-note">You are the job owner.</p>
                ) : (
                  <button className="apply-btn sidebar-apply-btn" onClick={handleApply}>
                    Apply Now
                  </button>
                )
              ) : (
                <p className="apply-note sidebar-note">Applications are currently closed.</p>
              )}
            </div>
          </aside>
        </div>

        <section className="job-related-section">
          <div className="job-related-header">
            <p className="job-detail-kicker">Related Jobs</p>
            <h2>More opportunities from the same category</h2>
          </div>

          <div className="job-related-grid">
            {relatedJobs.length ? (
              relatedJobs.slice(0, 3).map((item) => <JobCard key={item._id} job={item} />)
            ) : (
              <p className="job-sidebar-empty">No related jobs found yet.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetails;


