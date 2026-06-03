import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  formatEventDate,
  getEventExcerpt,
  getEventImageUrl,
  getEventLocationLabel,
  getEventOrganizerName,
} from "../../utils/eventUi";
const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const eventDate = formatEventDate(event?.date);
  const eventLocation = getEventLocationLabel(event);
  const organizerName = getEventOrganizerName(event);
  const imageUrl = getEventImageUrl(event?.image);

  const handleNavigate = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <article
      className="blog-card event-explore-card"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          handleNavigate();
        }
      }}
    >
      <div className="blog-image event-explore-card-image">
        <img
          src={imageUrl}
          alt={event?.title || "Event"}
          loading="lazy"
          decoding="async"
          width="1200"
          height="720"
        />
      </div>

      <div className="blog-card-content">
        <div className="event-explore-card-copy">
          <h3>{event?.title}</h3>
          <p>{getEventExcerpt(event?.description, 132)}</p>
        </div>

        <div className="event-explore-card-meta">
          <span>{eventDate}</span>
          <span>{eventLocation}</span>
          <span>{organizerName}</span>
        </div>

        <div className="blog-card-footer event-explore-card-footer">
          <div className="blog-meta">
            <span>{eventDate}</span>
            <span>&bull;</span>
            <span>{eventLocation}</span>
          </div>

          <Link
            to={`/events/${event._id}`}
            className="event-view-btn card-access-link"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default memo(EventCard);


