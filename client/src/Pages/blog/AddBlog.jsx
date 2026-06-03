import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import { blogCategories } from "../../assets/assets";
import {
  generatedContentToHtml,
  isMeaningfulArticleHtml,
  pasteArticleIntoQuill,
  sanitizeArticleHtml,
} from "../../utils/blogContent";

const AddBlog = () => {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const isEditMode = Boolean(blogId);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState(blogCategories[0]);
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your blog content here...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            ["link", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!isEditMode || !quillRef.current) return;

    const fetchBlog = async () => {
      try {
        setIsLoadingBlog(true);
        const { data } = await axios.get(`/admin/blog/${blogId}`);

        if (!data?.success) {
          toast.error(data?.message || "Failed to load blog");
          return;
        }

        const blog = data.blog;
        setTitle(blog.title || "");
        setSubTitle(blog.subTitle || "");
        setCategory(blog.category || blogCategories[0]);
        setIsPublished(Boolean(blog.isPublished));
        setIsFeatured(Boolean(blog.isFeatured));
        setIsUpcoming(Boolean(blog.isUpcoming));
        setCurrentImage(blog.image || "");
        quillRef.current.root.innerHTML = blog.description || "";
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load blog");
      } finally {
        setIsLoadingBlog(false);
      }
    };

    fetchBlog();
  }, [blogId, isEditMode]);

  const generateContent = async () => {
    if (!title.trim()) {
      return toast.error("Enter blog title or topic first");
    }

    try {
      setLoadingAI(true);

      const { data } = await axios.post("/admin/generate", {
        prompt: title,
        category,
      });

      if (data?.success && quillRef.current) {
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
      toast.error(error.response?.data?.message || "Unable to generate blog. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && !image) return toast.error("Upload image");
    if (!title.trim()) return toast.error("Title is required");
    if (!subTitle.trim()) return toast.error("Subtitle is required");

    const description = sanitizeArticleHtml(quillRef.current?.root?.innerHTML?.trim() || "");

    if (!description || description === "<p><br></p>") {
      return toast.error("Description is required");
    }

    try {
      setIsAdding(true);

      const blog = {
        title,
        subTitle,
        description,
        category,
        isPublished,
        isFeatured,
        isUpcoming,
      };

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blog));
      if (image) {
        formData.append("image", image);
      }

      const { data } = isEditMode
        ? await axios.put(`/blog/admin/update/${blogId}`, formData)
        : await axios.post("/blog/add", formData);

      if (data?.success) {
        toast.success(isEditMode ? "Blog updated successfully" : "Blog added successfully");

        if (isEditMode) {
          navigate("/admin/listBlog");
        } else {
          resetForm();
        }
      } else {
        toast.error(data?.message || (isEditMode ? "Failed to update blog" : "Failed to add blog"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (isEditMode ? "Failed to update blog" : "Failed to add blog"));
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setCurrentImage("");
    setTitle("");
    setSubTitle("");
    setCategory(blogCategories[0]);
    setIsPublished(false);
    setIsFeatured(false);
    setIsUpcoming(false);

    if (quillRef.current) {
      quillRef.current.root.innerHTML = "";
    }
  };

  return (
    <div className="addblog-wrapper">
      <form className="addblog-card" onSubmit={handleSubmit}>
        <h2>{isEditMode ? "Edit Blog" : "Create Blog"}</h2>

        {isLoadingBlog ? (
          <p className="ai-help-text">Loading blog...</p>
        ) : null}

        <div className="form-group">
          <label>{isEditMode ? "Replace Image" : "Upload Image"}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {isEditMode && currentImage ? (
            <p className="ai-help-text">Current image will stay unless you choose a new one.</p>
          ) : null}
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title or topic"
          />
        </div>

        <div className="form-group">
          <label>Subtitle</label>
          <input
            type="text"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="Enter blog subtitle"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <div
            ref={editorRef}
            className={`editor ${loadingAI ? "editor-loading" : ""}`}
          />
        </div>

        <button
          type="button"
          className="ai-btn"
          onClick={generateContent}
          disabled={loadingAI}
        >
          {loadingAI ? "Generating..." : "Generate with AI"}
        </button>

        <button
          type="button"
          className="ai-btn ai-btn-secondary"
          onClick={generateContent}
          disabled={loadingAI}
        >
          {loadingAI ? "Regenerating..." : "Regenerate"}
        </button>

        <p className="ai-help-text">You can edit the generated draft before adding the blog.</p>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {blogCategories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="publish-toggle">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>Publish</span>
        </div>

        <div className="publish-toggle">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          <span>Feature this blog</span>
        </div>

        <div className="publish-toggle">
          <input
            type="checkbox"
            checked={isUpcoming}
            onChange={(e) => setIsUpcoming(e.target.checked)}
          />
          <span>Mark as upcoming</span>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isAdding || isLoadingBlog}
        >
          {isAdding
            ? (isEditMode ? "Updating..." : "Adding...")
            : (isEditMode ? "Update Blog" : "Add Blog")}
        </button>
      </form>
    </div>
  );
};

export default AddBlog;


