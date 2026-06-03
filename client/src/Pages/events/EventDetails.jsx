import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import RegistrationForm from "../../Components/events/RegistrationForm";
import AuthPrompt from "../../Components/common/AuthPrompt";
import { useAuth } from "../../context/AuthContext";
import {
  buildRegistrationSuccessPayload,
  persistRegistrationSuccessPayload,
} from "../../utils/eventRegistrationSuccess";
import {
  formatEventDate,
  formatEventTime,
  getEventContentSections,
  getEventImageUrl,
  getEventLocationLabel,
  getEventOrganizerName,
} from "../../utils/eventUi";
const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [eventItem, setEventItem] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!location.state?.event);
  const [submitting, setSubmitting] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/events/public/${id}`);
        setEventItem(data.item || data.event || null);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const contentSections = useMemo(
    () => getEventContentSections(eventItem?.description),
    [eventItem?.description]
  );

  const handleRegisterClick = () => {
    if (!user) {
      return;
    }

    if (eventItem?.createdBy && user._id === eventItem.createdBy) {
      toast.error("You cannot register for your own event");
      return;
    }

    setRegistrationOpen(true);
  };

  const handleSubmitRegistration = async ({ phone }) => {
    if (!eventItem) {
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`/event-registrations/register/${eventItem._id}`, {
        phone,
      });

      const successPayload = buildRegistrationSuccessPayload({
        event: eventItem,
        user,
        registration: data?.registration,
      });

      persistRegistrationSuccessPayload(successPayload);
      toast.success("You have successfully registered");
      setRegistrationOpen(false);
      navigate("/events/registration-success", {
        state: {
          registrationSuccess: successPayload,
        },
      });
    } catch (error) {
      const status = error.response?.status;

      if (status === 400) {
        toast.error(error.response?.data?.message || "You have already registered for this event");
      } else {
        toast.error(error.response?.data?.message || "Failed to register");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="event-detail-loading">Loading event...</div>;
  }

  if (!eventItem) {
    return (
      <div className="event-detail-page">
        <Navbar />
        <main className="event-detail-main-layout">
          <section className="event-detail-empty">
            <p className="event-detail-kicker">Event Detail</p>
            <h1>Event not found</h1>
            <p>The event may still be under review or is no longer available publicly.</p>
            <Link to="/events" className="event-detail-secondary-btn">
              View Events
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = getEventImageUrl(eventItem.image);
  const organizerName = getEventOrganizerName(eventItem);
  const dateLabel = formatEventDate(eventItem.date);
  const timeLabel = formatEventTime(eventItem.time);
  const locationLabel = getEventLocationLabel(eventItem);

  return (
    <div className="event-detail-page">
      <Navbar />

      <section className="event-detail-hero">
        <img src={imageUrl} alt={eventItem.title} />
        <div className="event-detail-hero-overlay">
          <div className="event-detail-hero-content">
            <p className="event-detail-kicker">NAVAVERSE Events</p>
            <h1>{eventItem.title}</h1>
            <div className="event-detail-hero-meta">
              <span>{dateLabel}</span>
              <span>{locationLabel}</span>
              <span>{organizerName}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="event-detail-main-layout">
        <div className="event-detail-topbar">
          <Link to="/events" className="event-detail-back-link">
            Back to Events
          </Link>
        </div>

        <div className="event-detail-container">
          <section className="event-detail-content">
            <article className="event-detail-panel">
              <div className="event-detail-heading">
                <h2>{eventItem.title}</h2>
                <div className="event-detail-meta-row">
                  <span>{dateLabel}</span>
                  <span>{timeLabel}</span>
                  <span>{locationLabel}</span>
                </div>
              </div>

              <div className="event-detail-rich-copy">
                <section>
                  <h3>Full Description</h3>
                  <p>{contentSections.description}</p>
                </section>

                <section>
                  <h3>Event Agenda / Details</h3>
                  <p>{contentSections.details}</p>
                </section>

                {contentSections.requirements ? (
                  <section>
                    <h3>Requirements</h3>
                    <p>{contentSections.requirements}</p>
                  </section>
                ) : null}
              </div>
            </article>
          </section>

          <aside className="event-detail-sidebar">
            <article className="event-detail-panel event-detail-sidebar-panel">
              <h3>Event Overview</h3>

              <dl className="event-detail-sidebar-list">
                <div>
                  <dt>Date</dt>
                  <dd>{dateLabel}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{timeLabel}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{locationLabel}</dd>
                </div>
                <div>
                  <dt>Organizer</dt>
                  <dd>{organizerName}</dd>
                </div>
                {eventItem.availableSeats ? (
                  <div>
                    <dt>Available Seats</dt>
                    <dd>{eventItem.availableSeats}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="event-detail-actions">
                {user ? (
                  <button type="button" className="event-detail-primary-btn" onClick={handleRegisterClick}>
                    Register
                  </button>
                ) : (
                  <AuthPrompt compact description="Login to register for this event." />
                )}
              </div>
            </article>
          </aside>
        </div>
      </main>

      <RegistrationForm
        event={eventItem}
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        onSubmit={handleSubmitRegistration}
        submitting={submitting}
      />

      <Footer />
    </div>
  );
};

export default EventDetails;


