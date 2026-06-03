import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";

import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";

import JobCategory from "../../Components/jobs/JobCategory";
import JobCard from "../../Components/jobs/JobCard";
import JobFilter from "../../Components/jobs/JobFilter";
const JobsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchQuery);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
  });

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filters.jobType, filters.location]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/jobs", {
          params: {
            search: searchQuery || undefined,
            category: selectedCategory !== "All" ? selectedCategory : undefined,
            location: filters.location || undefined,
            jobType: filters.jobType || undefined,
          },
        });

        setJobs(data.jobs || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters.jobType, filters.location, searchQuery, selectedCategory]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(search)}`);
    } else {
      navigate("/jobs");
    }
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/jobs");
  };

  const applyFilters = ({ location, jobType }) => {
    setFilters({ location, jobType });
  };

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));

  const paginatedJobs = useMemo(
    () => jobs.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, jobs]
  );

  return (
    <div className="jobs-page">
      <Navbar />

      <main className="jobs-main">
        <section className="jobs-hero">
          <div className="jobs-hero-copy">
            <p className="jobs-eyebrow">NAVAVERSE Careers</p>
            <h1>Find your next role</h1>
            <p className="jobs-subtitle">
              Explore government, private sector, and internship opportunities in one place.
            </p>
          </div>

          <form className="jobs-search" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Search jobs, companies, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">Search</button>
            {search && (
              <button type="button" className="clear-btn" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>
        </section>

        <section className="jobs-filter-section">
          <div className="jobs-filter-layout">
            <JobCategory selectedCategory={selectedCategory} setCategory={setSelectedCategory} />
            <JobFilter onApplyFilters={applyFilters} />
          </div>
        </section>

        <section className="jobs-grid-section">
          <div className="jobs-grid-header">
            <p className="jobs-grid-count">
              {jobs.length ? `${jobs.length} opportunities found` : "No opportunities yet"}
            </p>
          </div>

          <div className="jobs-grid">
            {loading ? (
              <p className="jobs-empty">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="jobs-empty">No jobs found for the selected filters.</p>
            ) : (
              paginatedJobs.map((job) => <JobCard key={job._id} job={job} />)
            )}
          </div>

          {!loading && jobs.length > pageSize ? (
            <div className="jobs-pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default JobsPage;



