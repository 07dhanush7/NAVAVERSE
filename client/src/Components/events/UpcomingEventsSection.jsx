import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import axios, { assetUrl } from "../../api/axios";
const eventFallbackImage =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop";

const buildImageUrl = (path, fallback) => {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return assetUrl(encodeURI(path));
};

const UpcomingEventsSection = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/events/public?limit=3");
        setEvents(data.items || data.events || []);
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) {
    return null;
  }

  const formatEventDate = (dateValue) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue || "Coming soon";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="event-landing-section">
      <div className="event-landing-title-box">
        <h2>Meet the next community sessions</h2>
        <p className="event-landing-desc">
          Join our upcoming sessions to learn, connect, and grow with the community.
        </p>

        <Link to="/events" className="event-landing-see-all">
          Explore All -&gt;
        </Link>
      </div>

      <div className="upcoming-events-grid">
        {events.map((event) => {
          const imageUrl = buildImageUrl(event.image, eventFallbackImage);
          const organizer = event.creatorName || event.organizer || "Community Event";
          const tags = [event.category, event.mode, event.location]
            .filter(Boolean)
            .slice(0, 2);

          return (
            <div
              key={event._id}
              className="blog-card"
              onClick={() => navigate("/events")}
              role="button"
              tabIndex={0}
              onKeyDown={(evt) => {
                if (evt.key === "Enter" || evt.key === " ") {
                  evt.preventDefault();
                  navigate("/events");
                }
              }}
            >
              <div className="blog-image">
                <img
                  src={imageUrl}
                  alt={event.title || "Event"}
                  onError={(evt) => {
                    evt.currentTarget.onerror = null;
                    evt.currentTarget.src = eventFallbackImage;
                  }}
                />

                {tags.length ? (
                  <div className="blog-tags">
                    {tags.map((tag) => (
                      <span key={tag} className="blog-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="blog-card-content">
                <div className="event-card-copy">
                  <h3>{event.title}</h3>
                  <p>
                    {event.description ||
                      "Join the next session to learn, connect, and grow with the NAVAVERSE community."}
                  </p>
                </div>

                <div className="blog-card-footer">
                  <div className="blog-author-block">
                    <div className="blog-author-fallback" aria-hidden="true">
                      <CalendarDays size={16} />
                    </div>
                    <span className="blog-author-link static-author">{organizer}</span>
                  </div>

                  <div className="blog-meta">
                    <span>{formatEventDate(event.date)}</span>
                    <span>&bull;</span>
                    <span>{event.location || "Online"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;



