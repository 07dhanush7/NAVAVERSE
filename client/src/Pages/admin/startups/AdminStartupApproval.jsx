import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import axios, { assetUrl } from "../../../api/axios";
import StatusBadge from "../../../Components/content/StatusBadge";

const fallbackImage = "https://via.placeholder.com/400x220?text=NAVAVERSE+Startup";

const AdminStartupApproval = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    const fetchPendingStartups = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/startups/admin/pending");
        setStartups(data.items || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load startup requests");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingStartups();
  }, []);

  const handleApprove = async (startupId) => {
    try {
      const { data } = await axios.put(`/startups/admin/approve/${startupId}`);
      setStartups((current) => current.filter((startup) => startup._id !== startupId));
      toast.success(data.message || "Startup approved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve startup");
    }
  };

  const handleReject = async (startupId) => {
    try {
      const { data } = await axios.put(`/startups/admin/reject/${startupId}`, {
        rejectionReason: reasons[startupId] || "",
      });
      setStartups((current) => current.filter((startup) => startup._id !== startupId));
      toast.success(data.message || "Startup rejected successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject startup");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Startup Requests</h3>
            <p className="section-subtitle">
              Review startup submissions before they appear in Explore, Home, and detail pages.
            </p>
          </div>
        </div>

        <div className="startup-approval-grid">
          {loading ? (
            <div className="empty">Loading pending startups...</div>
          ) : startups.length === 0 ? (
            <div className="empty">No pending startup requests found.</div>
          ) : (
            startups.map((startup) => (
              <article key={startup._id} className="startup-approval-card">
                <img
                  src={
                    startup.startupImage
                      ? assetUrl(startup.startupImage)
                      : startup.image
                        ? assetUrl(startup.image)
                        : fallbackImage
                  }
                  alt={startup.title}
                />

                <div className="startup-approval-content">
                  <p className="startup-approval-category">{startup.category}</p>
                  <h4>{startup.title}</h4>
                  <p>{startup.description}</p>
                  <div className="startup-approval-meta">
                    <span>Founder: {startup.founderName || startup.creatorName}</span>
                    <span>Email: {startup.contactEmail}</span>
                    <StatusBadge status={startup.status || "pending"} />
                  </div>

                  <textarea
                    className="approval-reason"
                    rows="3"
                    placeholder="Optional rejection reason"
                    value={reasons[startup._id] || ""}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [startup._id]: event.target.value,
                      }))
                    }
                  />

                  <div className="job-table-actions">
                    <button
                      type="button"
                      className="job-action-btn primary"
                      onClick={() => handleApprove(startup._id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="job-action-btn danger"
                      onClick={() => handleReject(startup._id)}
                    >
                      Reject
                    </button>
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

export default AdminStartupApproval;


