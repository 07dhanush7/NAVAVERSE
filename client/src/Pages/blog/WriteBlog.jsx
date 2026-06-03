import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import {
  generatedContentToHtml,
  isMeaningfulArticleHtml,
  pasteArticleIntoQuill,
  sanitizeArticleHtml,
} from "../../utils/blogContent";

const WriteBlog = () => {

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= INIT QUILL ================= */

  useEffect(() => {

    if (editorRef.current && !quillRef.current) {

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your blog content here...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            ["link", "blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"]
          ]
        }
      });

    }

  }, []);

  /* ================= AI GENERATE ================= */

  const generateContent = async () => {

    if (!title.trim()) {
      return toast.error("Enter blog title or topic first");
    }

    try {

      setLoadingAI(true);

      const { data } = await axios.post("/blog/generate", {
        prompt: title
      });

      if (data.success && quillRef.current) {
        const html = generatedContentToHtml(data);

        if (!isMeaningfulArticleHtml(html)) {
          toast.error("Generated draft was incomplete. Please regenerate.");
          return;
        }

        pasteArticleIntoQuill(quillRef.current, html);
        toast.success("Detailed AI article generated");
      } else {
        toast.error(data?.message || "Unable to generate blog. Please try again.");

      }

    } catch (error) {

      console.error(error);
      toast.error(error.response?.data?.message || "Unable to generate blog. Please try again.");

    } finally {

      setLoadingAI(false);

    }

  };

  /* ================= SUBMIT BLOG ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!image) return toast.error("Upload image");
    if (!title.trim()) return toast.error("Title required");
    if (!subTitle.trim()) return toast.error("Subtitle required");

    if (!quillRef.current.getText().trim()) {
      return toast.error("Write blog content");
    }

    const description = sanitizeArticleHtml(quillRef.current.root.innerHTML);

    try {

      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("subTitle", subTitle);
      formData.append("description", description);
      formData.append("image", image);

      const { data } = await axios.post("/blog/create", formData);

      if (data.success) {
        toast.success("Your submission is under review");

        setTitle("");
        setSubTitle("");
        setImage(null);

        if (quillRef.current) {
          quillRef.current.setContents([]);
        }

      }

    } catch (error) {

      console.error(error.response?.data || error.message);
      toast.error("Failed to submit blog");

    } finally {

      setIsSubmitting(false);

    }

  };

  /* ================= UI ================= */

  return (
    <div className="startup-form-page">
      <Navbar />

      <main className="startup-form-main">
        <div className="startup-form-intro">
          <p className="startup-form-eyebrow">Blog Module</p>
          <h1>Publish your next story</h1>
          <p>
            Draft your article, generate ideas with AI, and submit it for review using the same
            polished creator flow used across NAVAVERSE.
          </p>
        </div>

        <div className="writer-wrapper startup-writer-wrapper">
          <form className="writer-card startup-writer-card" onSubmit={handleSubmit}>
            <h2>Write Blog</h2>

            {/* IMAGE */}

            <div className="writer-form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            {/* TITLE */}

            <div className="writer-form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter blog title or topic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* SUBTITLE */}

            <div className="writer-form-group">
              <label>Subtitle</label>
              <input
                type="text"
                placeholder="Enter blog subtitle"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
              />
            </div>

            {/* EDITOR */}

            <div className="writer-form-group">
              <label>Description</label>
              <div ref={editorRef} className="writer-editor"></div>
            </div>

            {/* AI GENERATE */}

            <button
              type="button"
              className="writer-ai-btn"
              onClick={generateContent}
              disabled={loadingAI}
            >
              {loadingAI ? "Generating..." : "Generate with AI"}
            </button>

            <button
              type="button"
              className="writer-ai-btn writer-ai-btn-secondary"
              onClick={generateContent}
              disabled={loadingAI}
            >
              {loadingAI ? "Regenerating..." : "Regenerate"}
            </button>

            <p className="writer-ai-help">Edit the generated draft freely before submitting.</p>

            {/* SUBMIT */}

            <button type="submit" className="writer-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Blog"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );

};

export default WriteBlog;


