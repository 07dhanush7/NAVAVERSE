import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { useAuth } from "../../context/AuthContext";

const jobCategories = ["KAS", "Central Govt", "Private IT", "Private Non-IT", "Internship"];
const jobTypes = ["Full-Time", "Part-Time", "Internship"];
const maxLogoSize = 5 * 1024 * 1024;

const initialForm = {
  title: "",
  company: "",
  location: "",
  salary: "",
  experience: "",
  skills: "",
  category: jobCategories[0],
  jobType: jobTypes[0],
  description: "",
};

const AddJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setCompanyLogo(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      setCompanyLogo(null);
      return;
    }

    if (file.size > maxLogoSize) {
      toast.error("Logo image must be under 5 MB");
      event.target.value = "";
      setCompanyLogo(null);
      return;
    }

    setCompanyLogo(file);
  };

  const validateForm = () => {
    if (!user) return "Please login to submit a job";
    if (!formData.title.trim()) return "Job title is required";
    if (!formData.company.trim()) return "Company name is required";
    if (!formData.location.trim()) return "Location is required";
    if (!formData.description.trim()) return "Description is required";
    if (!jobCategories.includes(formData.category)) return "Select a valid category";
    if (!jobTypes.includes(formData.jobType)) return "Select a valid job type";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (companyLogo) {
        payload.append("companyLogo", companyLogo);
      }

      await axios.post("/jobs/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Your submission is under review");
      setFormData(initialForm);
      setCompanyLogo(null);
      navigate("/dashboard");
    } catch (error) {
      const status = error.response?.status;
      const message =
        status === 401
          ? "Please login again to submit this job"
          : error.response?.data?.message || "Failed to submit job";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-job-page">
      <Navbar />

      <main className="add-job-main">
        <section className="add-job-card">
          <div className="add-job-heading">
            <p className="add-job-eyebrow">Job Submission</p>
            <h1>Post a job for review</h1>
            <p>
              Fill out the details below. Your job will be reviewed by the admin team before it
              appears publicly.
            </p>
          </div>

          <form className="add-job-form" onSubmit={handleSubmit}>
            <div className="add-job-grid">
              <label>
                Job Title
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Company Name
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Salary
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </label>

              <label>
                Experience
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </label>

              <label>
                Skills Required
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Communication"
                />
              </label>

              <label>
                Category
                <select name="category" value={formData.category} onChange={handleChange}>
                  {jobCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Job Type
                <select name="jobType" value={formData.jobType} onChange={handleChange}>
                  {jobTypes.map((jobType) => (
                    <option key={jobType} value={jobType}>
                      {jobType}
                    </option>
                  ))}
                </select>
              </label>

              <label className="add-job-file">
                Company Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <span className="add-job-file-name">
                  {companyLogo ? companyLogo.name : "No image selected"}
                </span>
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                required
              />
            </label>

            <button type="submit" className="add-job-submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Job"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AddJob;


