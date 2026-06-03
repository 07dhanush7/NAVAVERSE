import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import RegistrationCard from "../../Components/events/RegistrationCard";
import StatusBadge from "../../Components/content/StatusBadge";
import { formatEventDate, getEventImageUrl } from "../../utils/eventUi";
const Dashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [registrationsResponse, eventsResponse] = await Promise.all([
          axios.get("/event-registrations/my-events"),
          axios.get("/events/user/my-content"),
        ]);

        setRegistrations(registrationsResponse.data.registrations || registrationsResponse.data.items || []);
        setUserEvents(eventsResponse.data.events || eventsResponse.data.items || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load event dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const updateStatus = async (registrationId, status) => {
    try {
      const { data } = await axios.patch(`/event-registrations/${registrationId}/status`, {
        status,
      });

      setRegistrations((current) =>
        current.map((registration) =>
          registration._id === registrationId
            ? { ...registration, status: data.registration.status }
            : registration
        )
      );

      toast.success(data.message || "Registration updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update registration");
    }
  };

  return (
    <div className="event-dashboard-page">
      <Navbar />

      <main className="event-dashboard-main">
        <div className="event-dashboard-header">
          <p className="event-dashboard-kicker">Event Dashboard</p>
          <h1>Manage your events and registrations</h1>
          <p>Track approval status for your submissions and review people who registered.</p>
        </div>

        <section className="event-dashboard-section">
          <div className="event-dashboard-section-header">
            <div>
              <h2>My Event Requests</h2>
              <p>Pending, approved, and rejected event submissions are shown here.</p>
            </div>
          </div>

          {loading ? (
            <div className="event-dashboard-empty">Loading your events...</div>
          ) : userEvents.length === 0 ? (
            <div className="event-dashboard-empty">You have not submitted any events yet.</div>
          ) : (
            <div className="event-request-grid">
              {userEvents.map((eventItem) => (
                <article key={eventItem._id} className="event-request-card">
                  <img src={getEventImageUrl(eventItem.image)} alt={eventItem.title} />
                  <div className="event-request-card-body">
                    <div className="event-request-card-top">
                      <div>
                        <p className="event-request-card-kicker">{eventItem.organizer || "NAVAVERSE"}</p>
                        <h3>{eventItem.title}</h3>
                      </div>
                      <StatusBadge status={eventItem.status} />
                    </div>
                    <p>{eventItem.description}</p>
                    <div className="event-request-card-meta">
                      <span>{formatEventDate(eventItem.date)}</span>
                      <span>{eventItem.location || "Online"}</span>
                    </div>
                    {eventItem.rejectionReason ? (
                      <div className="event-request-reason">
                        <strong>Rejection reason:</strong> {eventItem.rejectionReason}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="event-dashboard-section">
          <div className="event-dashboard-section-header">
            <div>
              <h2>Registrations for My Events</h2>
              <p>Review the people who signed up for events you created.</p>
            </div>
          </div>

          {loading ? (
            <div className="event-dashboard-empty">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="event-dashboard-empty">No registrations for your events yet.</div>
          ) : (
            <div className="event-dashboard-list">
              {registrations.map((registration) => (
                <RegistrationCard
                  key={registration._id}
                  registration={registration}
                  onApprove={(id) => updateStatus(id, "Approved")}
                  onReject={(id) => updateStatus(id, "Rejected")}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;


