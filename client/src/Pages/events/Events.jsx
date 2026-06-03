import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import EventCard from "../../Components/events/EventCard";
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/events/public");
        setEvents(data.items || data.events || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const uniqueLocations = useMemo(
    () => ["All", ...new Set(events.map((eventItem) => eventItem.location || "Online").filter(Boolean))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return events.filter((eventItem) => {
      const matchesSearch =
        !searchValue ||
        [eventItem.title, eventItem.organizer, eventItem.description, eventItem.location, eventItem.creatorName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchValue));

      const matchesLocation =
        locationFilter === "All" || (eventItem.location || "Online") === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [events, locationFilter, search]);

  return (
    <div className="events-page">
      <Navbar />

      <main className="events-main">
        <section className="events-hero">
          <div className="events-hero-copy">
            <p className="events-kicker">NAVAVERSE Events</p>
            <h1>Explore approved events</h1>
            <p>
              Find workshops, meetups, demos, and community sessions curated through NAVAVERSE
              moderation.
            </p>
          </div>

          <div className="events-filter-card">
            <label htmlFor="event-location-filter">Location</label>
            <select
              id="event-location-filter"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
            >
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </section>

        <form className="events-search" onSubmit={(event) => event.preventDefault()}>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" onClick={() => setSearch("")}>
            Clear
          </button>
        </form>

        <section className="events-grid">
          {loading ? (
            <p className="events-empty">Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="events-empty">No approved events found for the current filters.</p>
          ) : (
            filteredEvents.map((eventItem) => <EventCard key={eventItem._id} event={eventItem} />)
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Events;



