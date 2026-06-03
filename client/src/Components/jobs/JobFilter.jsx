import { useState } from "react";
const JobFilter = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  return (
    <div className="job-filter">
      <div className="job-filter-header">
        <div>
          <p className="job-filter-kicker">Refine Search</p>
          <h3>Filter Jobs</h3>
        </div>
        <p className="job-filter-note">
          Narrow roles by location and type to find the right fit faster.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="job-filter-grid">
          <label>
            Location
            <select name="location" value={filters.location} onChange={handleChange}>
              <option value="">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mysore">Mysore</option>
              <option value="Hubli">Hubli</option>
              <option value="Remote">Remote</option>
            </select>
          </label>

          <label>
            Job Type
            <select name="jobType" value={filters.jobType} onChange={handleChange}>
              <option value="">All Job Types</option>
              <option value="Full-Time">Full Time</option>
              <option value="Part-Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </label>
        </div>

        <button type="submit">Apply Filters</button>
      </form>
    </div>
  );
};

export default JobFilter;