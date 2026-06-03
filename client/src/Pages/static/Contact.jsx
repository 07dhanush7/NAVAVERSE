import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import { useAuth } from "../../context/AuthContext";
const mapUrl = "https://www.google.com/maps?q=KGF,Karnataka,India&output=embed";
const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=KGF,Karnataka,India";

const Contact = () => {
  const { user } = useAuth();
  const userName = user?.username || "";
  const userEmail = user?.email || "";
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      name: userName,
      email: userEmail,
    }));
  }, [userEmail, userName]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending...");
    setIsSubmitting(true);

    const web3FormData = new FormData(event.target);
    web3FormData.append("access_key", "b334d244-7263-48fc-82c5-13ca51f61073");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3FormData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form submitted successfully.");
        toast.success("Thanks for reaching out. We'll get back to you soon.");
        setFormData({
          name: userName,
          email: userEmail,
          subject: "",
          message: "",
        });
      } else {
        setResult("Something went wrong. Please try again.");
        toast.error(data.message || "Unable to submit the form.");
      }
    } catch {
      setResult("Something went wrong. Please try again.");
      toast.error("Unable to submit the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="static-page">
      <Navbar />

      <main className="static-main">
        <section className="static-hero">
          <p className="static-kicker">Contact NAVAVERSE</p>
          <h1>Let's build the next connection together</h1>
          <p>
            Have a question, partnership idea, or support request? Send us a message and we'll
            help you get to the right place.
          </p>
        </section>

        <section className="static-section contact-section">
          <div className="static-form-layout">
            <form className="static-card static-form" onSubmit={handleSubmit}>
              <h2>Send a message</h2>

              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  readOnly
                  placeholder={userName || "Login to use your name"}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  placeholder={userEmail || "Login to use your email"}
                  required
                />
              </label>

              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                />
              </label>

              <button type="submit" className="static-button" disabled={isSubmitting}>
                <Send size={16} />
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              </button>
              {result && <span className="static-form-status">{result}</span>}
            </form>

            <aside className="static-card contact-info-card">
              <h2>Contact Info</h2>
              <div className="static-info-list">
                <div className="static-info-item">
                  <span>Email</span>
                  <a href="mailto:support@navaverse.com">
                    <Mail size={14} /> NAVAVERSE@gmail.com
                  </a>
                </div>
                <div className="static-info-item">
                  <span>Phone</span>
                  <a href="tel:+910000000000">
                    <Phone size={14} /> +91 9353394179
                  </a>
                </div>
                <div className="static-info-item">
                  <span>Address</span>
                  <strong>
                    <MapPin size={14} /> NAVAVERSE Studio, India
                  </strong>
                </div>
              </div>

              <div className="contact-info-map">
                <iframe
                  title="NAVAVERSE location in KGF, Karnataka, India"
                  src={mapUrl}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a href={directionsUrl} target="_blank" rel="noreferrer">
                  Get Directions
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
