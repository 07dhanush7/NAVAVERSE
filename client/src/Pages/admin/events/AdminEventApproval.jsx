import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../api/axios";
import StatusBadge from "../../../Components/content/StatusBadge";
import { formatEventDate, getEventImageUrl, getEventOrganizerName } from "../../../utils/eventUi";

const AdminEventApproval = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/events/admin/pending");
        setEvents(data.items || data.events || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load pending events");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvents();
  }, []);

  const handleApprove = async (eventId) => {
    try {
      const { data } = await axios.put(`/events/admin/approve/${eventId}`);
      setEvents((current) => current.filter((event) => event._id !== eventId));
      toast.success(data.message || "Event approved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve event");
    }
  };

  const handleReject = async (eventId) => {
    try {
      const { data } = await axios.put(`/events/admin/reject/${eventId}`, {
        rejectionReason: reasons[eventId] || "",
      });
      setEvents((current) => current.filter((event) => event._id !== eventId));
      toast.success(data.message || "Event rejected successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject event");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Event Approvals</h3>
            <p className="section-subtitle">Review user-submitted events before they go live publicly.</p>
          </div>
        </div>

        <div className="approval-card-grid">
          {loading ? (
            <div className="empty">Loading pending events...</div>
          ) : events.length === 0 ? (
            <div className="empty">No pending events found</div>
          ) : (
            events.map((event) => (
              <article key={event._id} className="approval-content-card">
                <img
                  src={getEventImageUrl(event.image)}
                  alt={event.title}
                  className="approval-card-image"
                />

                <div className="approval-card-body">
                  <p className="approval-card-kicker">{getEventOrganizerName(event)}</p>
                  <h4>{event.title}</h4>
                  <p className="approval-card-copy">
                    {event.description || "No description provided for this event yet."}
                  </p>

                  <div className="approval-card-meta">
                    <span>{formatEventDate(event.date)}</span>
                    <span>{event.time}</span>
                    <span>{event.location || "Online"}</span>
                    <span>Creator: {event.creatorName || "Unknown User"}</span>
                    <StatusBadge status={event.status || "pending"} />
                  </div>

                  <div className="approval-actions">
                    <textarea
                      className="approval-reason"
                      placeholder="Optional rejection reason"
                      value={reasons[event._id] || ""}
                      onChange={(e) =>
                        setReasons((current) => ({
                          ...current,
                          [event._id]: e.target.value,
                        }))
                      }
                      rows="3"
                    />
                    <div className="job-table-actions">
                      <button type="button" className="job-action-btn primary" onClick={() => handleApprove(event._id)}>
                        Approve
                      </button>
                      <button type="button" className="job-action-btn danger" onClick={() => handleReject(event._id)}>
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

export default AdminEventApproval;


