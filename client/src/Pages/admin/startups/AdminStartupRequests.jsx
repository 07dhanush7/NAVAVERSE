import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import axios from "../../../api/axios";
const AdminStartupRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/startups/admin/collaboration-requests");
        setRequests(data.items || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load collaboration requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId, status) => {
    try {
      const { data } = await axios.put(`/startups/admin/collaborations/${requestId}/status`, {
        status,
      });
      setRequests((current) =>
        current.map((request) =>
          request._id === requestId ? { ...request, status: data.item.status } : request
        )
      );
      toast.success(data.message || "Collaboration request updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update collaboration request");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Collaboration Requests</h3>
            <p className="section-subtitle">
              Review collaboration requests for admin-created startups using the same routing logic
              as user-created startups.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="empty">Loading collaboration requests...</p>
        ) : requests.length === 0 ? (
          <p className="empty">No collaboration requests found.</p>
        ) : (
          <div className="approval-card-grid">
            {requests.map((request) => (
              <article key={request._id} className="approval-content-card">
                <div className="approval-card-body">
                  <p className="approval-card-kicker">
                    {request.startupId?.title || "Startup removed"}
                  </p>
                  <h4>{request.role || "Collaboration Request"}</h4>
                  <p className="approval-card-copy">
                    {request.message || "No message provided."}
                  </p>

                  <div className="approval-card-meta">
                    <span>{request.name}</span>
                    <span>{request.email}</span>
                    <span>{request.skills || "Skills not provided"}</span>
                    <span className={`badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="job-table-actions">
                    <button
                      type="button"
                      className="job-action-btn primary"
                      onClick={() => handleStatusChange(request._id, "Accepted")}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="job-action-btn danger"
                      onClick={() => handleStatusChange(request._id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStartupRequests;


