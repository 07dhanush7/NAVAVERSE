import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axios from "../../api/axios";
import StartupCard from "./StartupCard";
const FeaturedStartupsSection = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const { data } = await axios.get("/startups/public", {
          params: { limit: 4 },
        });
        setStartups(data.items || []);
      } catch (error) {
        console.error("Featured startups fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  if (loading) {
    return (
      <section className="featured-startups-section">
        <div className="featured-startups-title-box">
          <h2>Featured Startups</h2>
          <p className="featured-startups-desc">
            Meet promising founders and products that are ready for collaboration.
          </p>
        </div>
        <div className="featured-startups-loading">Loading featured startups...</div>
      </section>
    );
  }

  if (!startups.length) {
    return null;
  }

  return (
    <section className="featured-startups-section">
      <div className="featured-startups-title-box">
        <h2>Featured Startups</h2>
        <p className="featured-startups-desc">
          Discover the latest approved startups from the NAVAVERSE community.
        </p>

        <Link to="/startups" className="featured-startups-see-all">
          View All Startups -&gt;
        </Link>
      </div>

      <div className="featured-startups-grid">
        {startups.map((startup) => (
          <StartupCard key={startup._id} startup={startup} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedStartupsSection;



