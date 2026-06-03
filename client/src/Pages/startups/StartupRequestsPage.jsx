import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import axios from "../../api/axios";
const StartupRequestsPage = () => {
  const [myStartups, setMyStartups] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [appliedRequests, setAppliedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [startupsRes, receivedRes, appliedRes] = await Promise.all([
        axios.get("/startups/user/my-content"),
        axios.get("/startups/user/collaboration-requests"),
        axios.get("/startups/user/collaborations/applied"),
      ]);

      setMyStartups(startupsRes.data.items || []);
      setReceivedRequests(receivedRes.data.items || []);
      setAppliedRequests(appliedRes.data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load startup dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    try {
      const { data } = await axios.put(`/startups/collaborations/${requestId}/status`, { status });
      setReceivedRequests((current) =>
        current.map((request) =>
          request._id === requestId ? { ...request, status: data.item.status } : request
        )
      );
      toast.success(data.message || "Collaboration request updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update request");
    }
  };

  return (
    <div className="my-job-applications-page startup-requests-page">
      <Navbar />

      <main className="my-job-applications-main">
        <section className="my-job-applications-card startup-requests-card">
          <div className="my-job-applications-heading">
            <p className="my-job-applications-eyebrow">Startup Dashboard</p>
            <h1>Startup Requests</h1>
            <p>
              Track your startup approvals, review collaboration requests, and monitor the
              applications you have already sent.
            </p>
          </div>

          {loading ? (
            <div className="applications-empty">Loading startup dashboard...</div>
          ) : (
            <div className="startup-dashboard-sections">
              <section className="startup-dashboard-panel">
                <div className="startup-panel-header">
                  <h2>My Startups</h2>
                </div>

                {myStartups.length ? (
                  <div className="startup-summary-grid">
                    {myStartups.map((startup) => (
                      <article key={startup._id} className="startup-summary-card">
                        <div>
                          <p className="startup-summary-status">{startup.status}</p>
                          <h3>{startup.title}</h3>
                          <p>{startup.tagline || startup.description}</p>
                        </div>
                        <div className="startup-summary-meta">
                          <span>{startup.category}</span>
                          <span>{startup.stage}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="applications-empty">You have not submitted any startups yet.</div>
                )}
              </section>

              <section className="startup-dashboard-panel">
                <div className="startup-panel-header">
                  <h2>Collaboration Requests</h2>
                </div>

                {receivedRequests.length ? (
                  <div className="startup-request-list">
                    {receivedRequests.map((request) => (
                      <article key={request._id} className="startup-request-card">
                        <div className="startup-request-top">
                          <div>
                            <p className="startup-request-startup">{request.startupId?.title}</p>
                            <h3>{request.name}</h3>
                            <p>{request.email}</p>
                          </div>
                          <span className={`startup-request-badge ${request.status.toLowerCase()}`}>
                            {request.status}
                          </span>
                        </div>

                        <div className="startup-request-grid">
                          <div>
                            <h4>Role</h4>
                            <p>{request.role}</p>
                          </div>
                          <div>
                            <h4>Skills</h4>
                            <p>{request.skills || "Not provided"}</p>
                          </div>
                          <div className="startup-request-message">
                            <h4>Message</h4>
                            <p>{request.message || "No message provided."}</p>
                          </div>
                        </div>

                        <div className="startup-request-actions">
                          <button type="button" onClick={() => updateRequestStatus(request._id, "Accepted")}>
                            Accept
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => updateRequestStatus(request._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="applications-empty">No collaboration requests yet.</div>
                )}
              </section>

              <section className="startup-dashboard-panel">
                <div className="startup-panel-header">
                  <h2>My Applications</h2>
                </div>

                {appliedRequests.length ? (
                  <div className="startup-summary-grid">
                    {appliedRequests.map((request) => (
                      <article key={request._id} className="startup-summary-card">
                        <div>
                          <p className="startup-summary-status">{request.status}</p>
                          <h3>{request.startupId?.title}</h3>
                          <p>{request.role}</p>
                        </div>
                        <div className="startup-summary-meta">
                          <span>{request.skills || "Generalist"}</span>
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="applications-empty">You have not applied to any startups yet.</div>
                )}
              </section>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StartupRequestsPage;


