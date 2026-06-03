import { ArrowUpRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
const mapUrl = "https://www.google.com/maps?q=KGF,Karnataka,India&output=embed";
const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=KGF,Karnataka,India";

const ContactLocation = () => {
  return (
    <section className="contact-location" aria-labelledby="contact-location-title">
      <div className="contact-location__header">
        <span className="contact-location__kicker">NAVAVERSE Studio</span>
        <h2 id="contact-location-title">Contact Location</h2>
        <p>
          Visit our KGF, Karnataka base where ideas, community, and future-ready digital
          experiences come together.
        </p>
      </div>

      <div className="contact-location__grid">
        <div className="contact-location__map-card">
          <iframe
            title="NAVAVERSE location in KGF, Karnataka, India"
            src={mapUrl}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <aside className="contact-location__details" aria-label="Location details">
          <div className="contact-location__detail">
            <span className="contact-location__icon" aria-hidden="true">
              <MapPin size={20} />
            </span>
            <div>
              <strong>KGF, Karnataka</strong>
              <p>India</p>
            </div>
          </div>

          <div className="contact-location__detail">
            <span className="contact-location__icon" aria-hidden="true">
              <Clock size={20} />
            </span>
            <div>
              <strong>Response Hours</strong>
              <p>Monday to Saturday, 10:00 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="contact-location__detail">
            <span className="contact-location__icon" aria-hidden="true">
              <Phone size={20} />
            </span>
            <div>
              <strong>Connect With Us</strong>
              <p>+91 9353394179</p>
            </div>
          </div>

          <a
            className="contact-location__button"
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={18} />
            <span>Get Directions</span>
            <ArrowUpRight size={16} />
          </a>
        </aside>
      </div>
    </section>
  );
};

export default ContactLocation;
