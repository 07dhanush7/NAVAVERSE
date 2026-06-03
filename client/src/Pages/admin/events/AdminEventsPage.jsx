import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../api/axios";
import RegistrationCard from "../../../Components/events/RegistrationCard";
const initialEventForm = {
  title: "",
  organizer: "",
  location: "",
  date: "",
  time: "",
  description: "",
};

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [image, setImage] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const { data } = await axios.get("/events/admin/all");
      setEvents(data.items || data.events || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoadingRegistrations(true);
      const { data } = await axios.get("/event-registrations/admin");
      setRegistrations(data.items || data.registrations || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load registrations");
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, [fetchEvents, fetchRegistrations]);

  const handleEventChange = (event) => {
    const { name, value } = event.target;
    setEventForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const payload = new FormData();
      Object.entries(eventForm).forEach(([key, value]) => payload.append(key, value));

      if (image) {
        payload.append("image", image);
      }

      const { data } = await axios.post("/events/admin/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(data.message || "Event created successfully");
      setEventForm(initialEventForm);
      setImage(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm("Delete this event? This will also remove its registrations.");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(eventId);
      const { data } = await axios.delete(`/events/admin/delete/${eventId}`);
      setEvents((current) => current.filter((eventItem) => eventItem._id !== eventId));
      toast.success(data.message || "Event deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    } finally {
      setDeletingId("");
    }
  };

  const updateStatus = async (registrationId, status) => {
    try {
      const { data } = await axios.patch(`/event-registrations/admin/${registrationId}/status`, {
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
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Events</h3>
            <p className="section-subtitle">Create admin events and manage registrations for admin-owned events.</p>
          </div>
        </div>

        <div className="job-dashboard-grid">
          <form className="job-dashboard-form" onSubmit={handleCreateEvent}>
            <h4>Add Event</h4>

            <div className="job-form-grid">
              <label>
                Title
                <input type="text" name="title" value={eventForm.title} onChange={handleEventChange} required />
              </label>

              <label>
                Organizer
                <input
                  type="text"
                  name="organizer"
                  value={eventForm.organizer}
                  onChange={handleEventChange}
                  required
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventChange}
                  required
                />
              </label>

              <label>
                Date
                <input type="date" name="date" value={eventForm.date} onChange={handleEventChange} required />
              </label>

              <label>
                Time
                <input type="time" name="time" value={eventForm.time} onChange={handleEventChange} required />
              </label>

              <label className="job-file-field">
                Event Image
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleEventChange}
                rows="6"
                required
              />
            </label>

            <button className="job-action-btn primary" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Event"}
            </button>
          </form>

          <div className="job-dashboard-panel">
            <div className="panel-header">
              <h4>All Events</h4>
              <p>{events.length} events available</p>
            </div>

            <div className="dashboard-table-wrap">
              <table className="performance-table job-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Organizer</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEvents ? (
                    <tr>
                      <td colSpan="7" className="empty">
                        Loading events...
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{event.organizer}</td>
                        <td>
                          {event.date} {event.time}
                        </td>
                        <td>{event.location}</td>
                        <td>{event.creatorName || "Unknown"}</td>
                        <td>{event.status}</td>
                        <td>
                          <div className="job-table-actions">
                            <button
                              type="button"
                              className="job-action-btn danger"
                              onClick={() => handleDeleteEvent(event._id)}
                              disabled={deletingId === event._id}
                            >
                              {deletingId === event._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Registrations</h3>
            <p className="section-subtitle">These registrations are routed only to admin-owned events.</p>
          </div>
        </div>

        {loadingRegistrations ? (
          <p className="empty">Loading registrations...</p>
        ) : registrations.length === 0 ? (
          <p className="empty">No registrations for admin events yet.</p>
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
      </div>
    </div>
  );
};

export default AdminEventsPage;


