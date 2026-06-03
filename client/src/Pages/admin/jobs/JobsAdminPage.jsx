import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../../api/axios";
const jobCategories = [
  "Karnataka Administrative Service",
  "Central Civil Services",
  "Private IT",
  "Private Non-IT",
  "Internship",
];

const jobTypes = ["Full-Time", "Part-Time", "Contract", "Internship"];

const initialJobForm = {
  title: "",
  companyName: "",
  location: "",
  salary: "",
  experience: "",
  skillsRequired: "",
  category: jobCategories[0],
  jobType: jobTypes[0],
  description: "",
};

const JobsAdminPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const { data } = await axios.get("/jobs/admin/all");
      setJobs(data.items || data.jobs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobFormChange = (event) => {
    const { name, value } = event.target;
    setJobForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddJob = async (event) => {
    event.preventDefault();
    setJobLoading(true);

    try {
      const formData = new FormData();

      Object.entries(jobForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (companyLogo) {
        formData.append("companyLogo", companyLogo);
      }

      const { data } = await axios.post("/jobs/admin/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(data.message || "Job created successfully");
      setJobForm(initialJobForm);
      setCompanyLogo(null);
      await fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create job");
    } finally {
      setJobLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`/jobs/admin/delete/${jobId}`);
      toast.success("Job deleted successfully");
      setJobs((current) => current.filter((job) => job._id !== jobId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Jobs</h3>
            <p className="section-subtitle">
              Create openings and manage listings from one place.
            </p>
          </div>
        </div>

        <div className="job-dashboard-grid">
          <form className="job-dashboard-form" onSubmit={handleAddJob}>
            <h4>Add Job</h4>

            <div className="job-form-grid">
              <label>
                Job Title
                <input
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobFormChange}
                  required
                />
              </label>

              <label>
                Company Name
                <input
                  type="text"
                  name="companyName"
                  value={jobForm.companyName}
                  onChange={handleJobFormChange}
                  required
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  name="location"
                  value={jobForm.location}
                  onChange={handleJobFormChange}
                  required
                />
              </label>

              <label>
                Salary
                <input
                  type="text"
                  name="salary"
                  value={jobForm.salary}
                  onChange={handleJobFormChange}
                />
              </label>

              <label>
                Experience
                <input
                  type="text"
                  name="experience"
                  value={jobForm.experience}
                  onChange={handleJobFormChange}
                />
              </label>

              <label>
                Skills Required
                <input
                  type="text"
                  name="skillsRequired"
                  value={jobForm.skillsRequired}
                  onChange={handleJobFormChange}
                  placeholder="React, Node.js, MongoDB"
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={jobForm.category}
                  onChange={handleJobFormChange}
                >
                  {jobCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Job Type
                <select
                  name="jobType"
                  value={jobForm.jobType}
                  onChange={handleJobFormChange}
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="job-file-field">
                Company Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setCompanyLogo(event.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleJobFormChange}
                rows="6"
                required
              />
            </label>

            <button
              className="job-action-btn primary"
              type="submit"
              disabled={jobLoading}
            >
              {jobLoading ? "Creating..." : "Create Job"}
            </button>
          </form>

          <div className="job-dashboard-panel">
            <div className="panel-header">
              <h4>Manage Jobs</h4>
              <p>{jobs.length} listings available</p>
            </div>

            <div className="dashboard-table-wrap">
              <table className="performance-table job-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingJobs ? (
                    <tr>
                      <td colSpan="6" className="empty">
                        Loading job listings...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty">
                        No job listings available
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.title}</td>
                        <td>{job.companyName}</td>
                        <td>{job.category}</td>
                        <td>{job.location}</td>
                        <td>
                          {job.creatorRole === "admin" ? (
                            <button
                              type="button"
                              className="job-action-btn"
                              onClick={() => navigate(`/admin/jobs/${job._id}/applications`)}
                            >
                              View Applications
                            </button>
                          ) : (
                            <span className="empty">Owner only</span>
                          )}
                        </td>
                        <td>
                          <div className="job-table-actions">
                            <button
                              type="button"
                              className="job-action-btn danger"
                              onClick={() => handleDeleteJob(job._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsAdminPage;


