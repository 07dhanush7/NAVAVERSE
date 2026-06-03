import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [job, setJob] = useState(null);
  const [checkingJob, setCheckingJob] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setCheckingJob(true);
        const { data } = await axios.get(`/jobs/${id}`);
        setJob(data.job || null);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load job");
        navigate("/jobs");
      } finally {
        setCheckingJob(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  if (checkingJob) {
    return (
      <div className="apply-job-page">
        <Navbar />
        <main className="apply-job-main">
          <section className="apply-job-card apply-job-state">
            <h1>Loading application</h1>
            <p className="apply-job-note">Preparing the job details for your application.</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwnJob = user?._id && job?.createdBy && user._id === job.createdBy;
  const canAcceptApplications = job?.status === "approved" && Boolean(job?.createdBy);
  const candidateName = user?.username || "";
  const candidateEmail = user?.email || "";

  if (!job || !canAcceptApplications || isOwnJob) {
    return (
      <div className="apply-job-page">
        <Navbar />
        <main className="apply-job-main">
          <section className="apply-job-card apply-job-state">
            <h1>Applications Unavailable</h1>
            <p className="apply-job-note">
              {isOwnJob
                ? "You cannot apply to your own job posting."
                : "This job is not accepting applications right now."}
            </p>
            <button type="button" className="apply-job-back-btn" onClick={() => navigate(job ? `/jobs/${id}` : "/jobs")}>
              Back to Job
            </button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("coverLetter", coverLetter);
      formData.append("phone", phone);
      formData.append("skills", skills);

      await axios.post(`/jobs/apply/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Application submitted successfully");
      navigate("/jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-job-page">
      <Navbar />

      <main className="apply-job-main">
        <section className="apply-job-hero">
          <p className="apply-job-kicker">Job Application</p>
          <h1>Apply for {job.title}</h1>
          <p>
            Submit your resume and cover letter for <strong>{job.companyName}</strong>. Your
            profile details are prefilled for a smoother application flow.
          </p>
        </section>

        <section className="apply-job-layout">
          <form className="apply-job-card apply-job-form-card" onSubmit={handleSubmit}>
            <h2>Application Form</h2>

            <div className="apply-job-grid">
              <div className="writer-form-group">
                <label>Name</label>
                <input type="text" value={candidateName} readOnly />
              </div>

              <div className="writer-form-group">
                <label>Email</label>
                <input type="email" value={candidateEmail} readOnly />
              </div>

              <div className="writer-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="writer-form-group">
                <label>Skills</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Communication"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="writer-form-group apply-job-full">
                <label>Resume Upload</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                />
              </div>

              <div className="writer-form-group apply-job-full">
                <label>Cover Letter</label>
                <textarea
                  placeholder="Write a short cover letter..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="writer-submit-btn apply-job-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>

          <aside className="apply-job-card apply-job-sidebar">
            <h2>Job Summary</h2>
            <div className="apply-job-summary">
              <div>
                <span>Company</span>
                <strong>{job.companyName}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{job.location || "Remote"}</strong>
              </div>
              <div>
                <span>Job Type</span>
                <strong>{job.jobType || "Full Time"}</strong>
              </div>
              <div>
                <span>Salary</span>
                <strong>{job.salary || "Salary not disclosed"}</strong>
              </div>
            </div>

            <p className="apply-job-note">
              The application uses your authenticated profile details and the uploaded resume to
              keep the backend flow unchanged.
            </p>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyJob;


