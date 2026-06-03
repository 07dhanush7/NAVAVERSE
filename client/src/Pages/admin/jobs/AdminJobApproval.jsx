import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios, { assetUrl } from "../../../api/axios";
import StatusBadge from "../../../Components/content/StatusBadge";

const AdminJobApproval = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/admin/jobs/pending");
        setJobs(data.items || data.jobs || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load pending jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingJobs();
  }, []);

  const handleApprove = async (jobId) => {
    try {
      const { data } = await axios.put(`/admin/jobs/approve/${jobId}`);
      setJobs((current) => current.filter((job) => job._id !== jobId));
      toast.success(data.message || "Job approved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve job");
    }
  };

  const handleReject = async (jobId) => {
    try {
      const { data } = await axios.put(`/admin/jobs/reject/${jobId}`, {
        rejectionReason: reasons[jobId] || "",
      });
      setJobs((current) => current.filter((job) => job._id !== jobId));
      toast.success(data.message || "Job rejected successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject job");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Job Approvals</h3>
            <p className="section-subtitle">
              Review user-submitted jobs and decide which ones go live publicly.
            </p>
          </div>
        </div>

        <div className="approval-card-grid">
          {loading ? (
            <div className="empty">Loading pending jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="empty">No pending jobs found</div>
          ) : (
            jobs.map((job) => (
              <article key={job._id} className="approval-content-card">
                <img
                  src={
                    job.companyLogo
                      ? assetUrl(job.companyLogo)
                      : "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop"
                  }
                  alt={job.title}
                  className="approval-card-image"
                />

                <div className="approval-card-body">
                  <p className="approval-card-kicker">{job.category}</p>
                  <h4>{job.title}</h4>
                  <p className="approval-card-copy">
                    {job.description || "No description provided for this job yet."}
                  </p>

                  <div className="approval-card-meta">
                    <span>{job.companyName}</span>
                    <span>{job.location || "Remote"}</span>
                    <span>{job.creatorName || "Unknown User"}</span>
                    <StatusBadge status={job.status || "pending"} />
                  </div>

                  <div className="approval-actions">
                    <textarea
                      className="approval-reason"
                      placeholder="Optional rejection reason"
                      value={reasons[job._id] || ""}
                      onChange={(event) =>
                        setReasons((current) => ({
                          ...current,
                          [job._id]: event.target.value,
                        }))
                      }
                      rows="3"
                    />
                    <div className="job-table-actions">
                      <button
                        type="button"
                        className="job-action-btn primary"
                        onClick={() => handleApprove(job._id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="job-action-btn danger"
                        onClick={() => handleReject(job._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobApproval;


