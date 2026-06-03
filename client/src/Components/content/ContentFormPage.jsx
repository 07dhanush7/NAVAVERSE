import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
const ContentFormPage = ({
  title,
  subtitle,
  apiPath,
  fields,
  initialValues,
  imageFieldName = "image",
}) => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialValues);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fieldMap = useMemo(() => fields, [fields]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const formData = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (image) {
        formData.append(imageFieldName, image);
      }

      await axios.post(apiPath, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Your submission is under admin review");
      navigate("/dashboard/user");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit content");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-form-page">
      <Navbar />

      <main className="content-form-main">
        <section className="content-form-header">
          <p className="content-form-kicker">NAVAVERSE Creator Tools</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>

        <form className="content-form-card" onSubmit={handleSubmit}>
          <div className="content-form-grid">
            {fieldMap.map((field) => (
              <label
                key={field.name}
                className={field.type === "textarea" ? "content-form-full" : ""}
              >
                {field.label}
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formValues[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows={6}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formValues[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </label>
            ))}

            <label className="content-form-full">
              Image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          <button type="submit" className="content-form-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ContentFormPage;


