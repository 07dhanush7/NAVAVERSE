import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import StartupCard from "../../Components/startups/StartupCard";
import axios from "../../api/axios";
const StartupsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [search, setSearch] = useState(searchQuery);
  const [selectedStage, setSelectedStage] = useState("All");
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/startups/public");
        setStartups(data.items || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch startups");
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      const matchesSearch = [startup.title, startup.tagline, startup.description, startup.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = selectedStage === "All" || startup.stage === selectedStage;
      return matchesSearch && matchesStage;
    });
  }, [searchQuery, selectedStage, startups]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/startups?search=${encodeURIComponent(search)}` : "/startups");
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/startups");
  };

  return (
    <div className="jobs-page startups-page">
      <Navbar />

      <main className="catalog-page-shell">
        <section className="catalog-hero">
          <div className="catalog-hero-copy">
            <p className="jobs-eyebrow">NAVAVERSE Startups</p>
            <h1>Explore approved startups</h1>
            <p className="catalog-subtitle">
              Browse founders, discover ideas in motion, and collaborate with teams building
              across the NAVAVERSE ecosystem.
            </p>
          </div>

          <div className="catalog-controls">
            <div className="catalog-filter-card">
              <label htmlFor="startup-stage-filter">Stage</label>
              <select
                id="startup-stage-filter"
                value={selectedStage}
                onChange={(event) => setSelectedStage(event.target.value)}
              >
                <option value="All">All stages</option>
                <option value="Idea">Idea</option>
                <option value="MVP">MVP</option>
                <option value="Funded">Funded</option>
              </select>
            </div>

            <form className="catalog-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search startups..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="catalog-search-actions">
                <button type="submit">Search</button>
                {search ? (
                  <button type="button" className="clear-btn" onClick={clearSearch}>
                    Clear
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        <section className="catalog-grid-section">
          {loading ? (
            <div className="catalog-empty-state">
              <p className="catalog-empty-title">Loading Startups</p>
              <p className="catalog-empty-copy">Preparing the latest approved startup listings.</p>
            </div>
          ) : filteredStartups.length === 0 ? (
            <div className="catalog-empty-state">
              <p className="catalog-empty-title">No Startups Found</p>
              <p className="catalog-empty-copy">Be the first to share your startup idea.</p>
              <button
                type="button"
                className="catalog-empty-btn"
                onClick={() => navigate("/startups/add")}
              >
                Add Startup
              </button>
            </div>
          ) : (
            <section className="catalog-grid">
              {filteredStartups.map((startup) => (
                <StartupCard key={startup._id} startup={startup} />
              ))}
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StartupsPage;