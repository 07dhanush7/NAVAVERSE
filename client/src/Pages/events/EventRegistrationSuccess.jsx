import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import Logo from "../../assets/Logo.webp";
import {
  getPersistedRegistrationSuccessPayload,
  persistRegistrationSuccessPayload,
} from "../../utils/eventRegistrationSuccess";
import { generateRegistrationConfirmationPdf } from "../../utils/registrationConfirmationPdf";
import { getEventImageUrl } from "../../utils/eventUi";
const EventRegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfTemplateRef = useRef(null);
  const [registrationData, setRegistrationData] = useState(
    () => location.state?.registrationSuccess || getPersistedRegistrationSuccessPayload()
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      persistRegistrationSuccessPayload(location.state.registrationSuccess);
      setRegistrationData(location.state.registrationSuccess);
    }
  }, [location.state]);

  const handleDownload = async () => {
    if (!registrationData || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);
      await generateRegistrationConfirmationPdf({
        eventName: registrationData.event.name,
        templateElement: pdfTemplateRef.current,
      });
    } catch (error) {
      toast.error(error.message || "Failed to generate confirmation PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!registrationData) {
    return (
      <div className="event-registration-success-page">
        <Navbar />
        <main className="event-registration-success-main">
          <section className="event-registration-success-card event-registration-success-empty">
            <p className="event-registration-success-kicker">Registration Notice</p>
            <h1>No registration confirmation found</h1>
            <p>
              Register for an event first, then you will be redirected here with your confirmation
              details and downloadable NOV PDF.
            </p>
            <div className="event-registration-success-actions">
              <button type="button" onClick={() => navigate("/events")}>
                View Events
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const { event, user, registration } = registrationData;

  return (
    <div className="event-registration-success-page">
      <Navbar />

      <main className="event-registration-success-main">
        <section className="event-registration-success-card">
          <div className="event-registration-success-hero">
            <div className="event-registration-success-copy">
              <p className="event-registration-success-kicker">Registration Success</p>
              <h1>You have successfully registered</h1>
              <p>
                Your registration is confirmed. Your NAVAVERSE Notice of Registration is ready to
                download as a PDF.
              </p>
            </div>

            <div className="event-registration-success-event">
              <img src={getEventImageUrl(event.image)} alt={event.name} />
            </div>
          </div>

          <div className="event-registration-success-grid">
            <article className="event-registration-success-panel">
              <h2>Event Details</h2>
              <dl>
                <div>
                  <dt>Event Name</dt>
                  <dd>{event.name}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{event.dateLabel}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{event.time}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{event.location}</dd>
                </div>
              </dl>
            </article>

            <article className="event-registration-success-panel">
              <h2>User Details</h2>
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{user.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
              </dl>
            </article>

            <article className="event-registration-success-panel">
              <h2>Registration Details</h2>
              <dl>
                <div>
                  <dt>Registration ID</dt>
                  <dd>{registration.id}</dd>
                </div>
                <div>
                  <dt>Registration Date</dt>
                  <dd>{registration.dateLabel}</dd>
                </div>
              </dl>
            </article>
          </div>

          <div className="event-registration-success-actions">
            <button type="button" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? "Preparing PDF..." : "Download Confirmation (PDF)"}
            </button>
            <Link to="/events">View Events</Link>
          </div>
        </section>
      </main>

      <div className="event-registration-pdf-root" aria-hidden="true">
        <div ref={pdfTemplateRef} className="event-registration-pdf-template">
          <header className="event-registration-pdf-header">
            <div className="event-registration-pdf-brand">
              <img src={Logo} alt="NAVAVERSE logo" />
              <div>
                <strong>NAVAVERSE</strong>
                <span>Connect • Build • Grow</span>
              </div>
            </div>
          </header>

          <section className="event-registration-pdf-title">
            <h1>Event Registration Confirmation</h1>
          </section>

          {event.image ? (
            <section className="event-registration-pdf-banner">
              <img src={getEventImageUrl(event.image)} alt={event.name} />
            </section>
          ) : null}

          <section className="event-registration-pdf-section">
            <h2>Event Details</h2>
            <div className="event-registration-pdf-table">
              <div>
                <span>Event Name</span>
                <strong>{event.name}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>{event.dateLabel}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{event.time}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{event.location}</strong>
              </div>
            </div>
          </section>

          <section className="event-registration-pdf-section">
            <h2>User Details</h2>
            <div className="event-registration-pdf-table">
              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
            </div>
          </section>

          <section className="event-registration-pdf-section">
            <h2>Registration Details</h2>
            <div className="event-registration-pdf-table">
              <div>
                <span>Registration ID</span>
                <strong>{registration.id}</strong>
              </div>
              <div>
                <span>Registration Date</span>
                <strong>{registration.dateLabel}</strong>
              </div>
            </div>
          </section>

          <section className="event-registration-pdf-about">
            <h2>About NAVAVERSE</h2>
            <p>
              NAVAVERSE is a platform connecting developers, startups, and opportunities through
              blogs, jobs, events, and courses.
            </p>
          </section>

          <footer className="event-registration-pdf-footer">
            <p>Thank you for registering with NAVAVERSE</p>
            <p>© NAVAVERSE</p>
          </footer>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventRegistrationSuccess;


