import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
const stageOptions = ["Idea", "MVP", "Funded"];

const AddStartupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialState = useMemo(
    () => ({
      title: "",
      tagline: "",
      description: "",
      category: "",
      stage: "Idea",
      location: "",
      website: "",
      founderName: user?.username || "",
      contactEmail: user?.email || "",
      problem: "",
      solution: "",
      vision: "",
    }),
    [user?.email, user?.username]
  );

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (image) {
        payload.append("image", image);
      }

      const { data } = await axios.post("/startups/create", payload);

      if (data.success) {
        toast.success("Your submission is under review");
        navigate("/startups/requests");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit startup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="startup-form-page">
      <Navbar />

      <main className="startup-form-main">
        <div className="startup-form-intro">
          <p className="startup-form-eyebrow">Startup Module</p>
          <h1>Launch your startup profile</h1>
          <p>
            Share your startup, get reviewed by admin, and start receiving collaboration
            requests once it is approved.
          </p>
        </div>

        <div className="writer-wrapper startup-writer-wrapper">
          <form className="writer-card startup-writer-card" onSubmit={handleSubmit}>
            <h2>Add Startup</h2>

            <div className="writer-form-group">
              <label>Startup Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <div className="startup-preview">
                <img
                  src={preview || "https://via.placeholder.com/1200x720?text=NAVAVERSE+Startup"}
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

            <button type="submit" className="writer-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Startup"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddStartupPage;


