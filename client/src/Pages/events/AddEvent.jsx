import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { useAuth } from "../../context/AuthContext";
const initialForm = {
  title: "",
  organizer: "",
  location: "",
  date: "",
  time: "",
  description: "",
};

const AddEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setFormData((current) => ({
        ...current,
        organizer: current.organizer || user.username,
      }));
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));

      if (image) {
        payload.append("image", image);
      }

      await axios.post("/events/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Your submission is under review");
      setFormData(initialForm);
      setImage(null);
      navigate("/events/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-event-page">
      <Navbar />

      <main className="add-event-main">
        <section className="add-event-card">
          <div className="add-event-header">
            <p className="add-event-kicker">NAVAVERSE Events</p>
            <h1>Host a new event</h1>
            <p>Create an event proposal and send it to the admin team for approval.</p>
          </div>

          <form className="add-event-form" onSubmit={handleSubmit}>
            <div className="add-event-grid">
              <label>
                Title
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </label>

              <label>
                Organizer
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder={user?.username || "Organizer name"}
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
                Date
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </label>

              <label>
                Time
                <input type="time" name="time" value={formData.time} onChange={handleChange} required />
              </label>

              <label>
                Event Image
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
            </div>

            <label className="add-event-full">
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="7"
                required
              />
            </label>

            <button type="submit" className="add-event-submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Event"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AddEvent;


