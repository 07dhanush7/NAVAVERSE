import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios, { assetUrl } from "../../../api/axios";
const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Startup";
const stageOptions = ["Idea", "MVP", "Funded"];

const initialStartupForm = {
  title: "",
  tagline: "",
  description: "",
  category: "",
  stage: "Idea",
  location: "",
  website: "",
  founderName: "NAVAVERSE Admin",
  contactEmail: "",
  problem: "",
  solution: "",
  vision: "",
};

const AdminStartupsPage = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState(initialStartupForm);

  const fetchStartups = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/startups/admin/all");
      setStartups(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load startups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  const approvedStartups = useMemo(
    () => startups.filter((startup) => String(startup.status).toLowerCase() === "approved"),
    [startups]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title required";
    if (!formData.tagline.trim()) return "Tagline required";
    if (!formData.description.trim()) return "Description required";
    if (!formData.category.trim()) return "Category required";
    if (!formData.founderName.trim()) return "Founder name required";
    if (!formData.contactEmail.trim()) return "Email required";
    return "";
  };

  const resetForm = () => {
    setImage(null);
    setPreview("");
    setFormData(initialStartupForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (image) {
        payload.append("image", image);
      }

      const { data } = await axios.post("/startups/admin/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(data.message || "Startup created successfully");
      resetForm();
      fetchStartups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create startup");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (startupId) => {
    try {
      setDeletingId(startupId);
      const { data } = await axios.delete(`/startups/user/delete/${startupId}`);
      setStartups((current) => current.filter((startup) => startup._id !== startupId));
      toast.success(data.message || "Startup deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete startup");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Startups</h3>
            <p className="section-subtitle">
              Publish admin startups directly and manage the live startup catalogue from the same dashboard.
            </p>
          </div>
        </div>

        <div className="job-dashboard-grid admin-startup-grid">
          <div className="job-dashboard-form admin-startup-form-wrap">
            <h4>Add Startup as Admin</h4>

            <form className="admin-startup-form" onSubmit={handleSubmit}>
              <div className="writer-form-group">
                <label>Startup Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <div className="startup-preview">
                  <img
                    src={preview || fallbackImage}
                    alt="Startup preview"
                  />
                </div>
              </div>

              <div className="startup-form-grid">
                <div className="writer-form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter startup title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group">
                  <label>Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    placeholder="Short tagline for your startup"
                    value={formData.tagline}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group startup-form-group-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="5"
                    placeholder="Tell people what your startup does"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="FinTech, EdTech, AI, Health..."
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group">
                  <label>Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleChange}>
                    {stageOptions.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="writer-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City, State, Country"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://yourstartup.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group">
                  <label>Founder Name</label>
                  <input
                    type="text"
                    name="founderName"
                    placeholder="Founder or team lead"
                    value={formData.founderName}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="founder@startup.com"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group startup-form-group-full">
                  <label>Problem</label>
                  <textarea
                    name="problem"
                    rows="4"
                    placeholder="What problem are you solving?"
                    value={formData.problem}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group startup-form-group-full">
                  <label>Solution</label>
                  <textarea
                    name="solution"
                    rows="4"
                    placeholder="How does your startup solve it?"
                    value={formData.solution}
                    onChange={handleChange}
                  />
                </div>

                <div className="writer-form-group startup-form-group-full">
                  <label>Vision</label>
                  <textarea
                    name="vision"
                    rows="4"
                    placeholder="What future are you building toward?"
                    value={formData.vision}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="job-action-btn primary admin-startup-submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Startup"}
              </button>
            </form>
          </div>

          <div className="job-dashboard-panel">
            <div className="panel-header">
              <h4>Published Startups</h4>
              <p>{approvedStartups.length} live startups</p>
            </div>

            {loading ? (
              <div className="empty">Loading startups...</div>
            ) : approvedStartups.length === 0 ? (
              <div className="empty">No approved startups found.</div>
            ) : (
              <div className="startup-approval-grid">
                {approvedStartups.map((startup) => (
                  <article key={startup._id} className="startup-approval-card">
                    <img
                      src={
                        startup.startupImage
                          ? assetUrl(startup.startupImage)
                          : startup.image
                            ? assetUrl(startup.image)
                            : fallbackImage
                      }
                      alt={startup.title}
                    />

                    <div className="startup-approval-content">
                      <p className="startup-approval-category">{startup.category}</p>
                      <h4>{startup.title}</h4>
                      <p>{startup.description || "No startup description was provided."}</p>

                      <div className="startup-approval-meta">
                        <span>{startup.stage || "Idea"}</span>
                        <span>{startup.location || "Global"}</span>
                        <span>{startup.founderName || startup.creatorName || "Admin"}</span>
                      </div>

                      <div className="job-table-actions">
                        <Link to={`/startups/${startup._id}`} className="job-action-btn secondary">
                          View
                        </Link>
                        <button
                          type="button"
                          className="job-action-btn danger"
                          onClick={() => handleDelete(startup._id)}
                          disabled={deletingId === startup._id}
                        >
                          {deletingId === startup._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStartupsPage;


