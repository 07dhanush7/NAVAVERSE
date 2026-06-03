import { useEffect, useState } from "react";
import axios, { assetUrl } from "../../api/axios";
import toast from "react-hot-toast";
import StatusBadge from "../../Components/content/StatusBadge";
const categories = [
  "Technology",
  "Startup",
  "Lifestyle",
  "Social Affairs",
  "Finance",
  "Education",
  "Movies & Series",
  "Travel & Explore",
  "Foods & Reviews",
  "Sports",
  "Others",
];

const PendingBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingBlogs = async () => {
    try {
      const { data } = await axios.get("/blog/admin/pending");

      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch {
      toast.error("Failed to load pending blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBlogs();
  }, []);

  const approveBlog = async (id, category) => {
    if (!category) {
      return toast.error("Select category first");
    }

    try {
      const { data } = await axios.put(`/blog/admin/update/${id}`, {
        category,
        status: "approved",
        isPublished: true,
      });

      if (data.success) {
        toast.success("Blog approved");
        setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      }
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectBlog = async (id, rejectionReason) => {
    try {
      const { data } = await axios.put(`/blog/admin/update/${id}`, {
        status: "rejected",
        isPublished: false,
        rejectionReason,
      });

      if (data.success) {
        toast.success("Blog rejected");
        setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      }
    } catch {
      toast.error("Reject failed");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="section">
          <p className="empty">Loading pending blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Blog Requests</h3>
            <p className="section-subtitle">
              Review user-submitted blogs, assign the right category, and publish only the ready ones.
            </p>
          </div>
        </div>

        <div className="pending-grid">
          {blogs.length === 0 ? (
            <p className="empty">No pending blog requests found.</p>
          ) : (
            blogs.map((blog) => (
              <PendingCard
                key={blog._id}
                blog={blog}
                approveBlog={approveBlog}
                rejectBlog={rejectBlog}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const PendingCard = ({ blog, approveBlog, rejectBlog }) => {
  const [category, setCategory] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  return (
    <div className="pending-card">
      <img src={assetUrl(blog.image)} alt={blog.title} />

        <div className="pending-card-body">
          <p className="pending-kicker">{blog.category || "Blog Submission"}</p>
          <h4 className="admin-request-title">{blog.title}</h4>
          <p>{blog.subTitle}</p>
          <small>By: {blog.creator?.username || "Unknown Creator"}</small>
          <StatusBadge status={blog.status || (blog.isPublished ? "approved" : "pending")} />

        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <textarea
          className="approval-reason form-input"
          rows="3"
          placeholder="Optional rejection reason"
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
        />

        <div className="pending-actions">
          <button
            className="job-action-btn primary btn-primary"
            onClick={() => approveBlog(blog._id, category)}
          >
            Approve
          </button>

          <button
            className="job-action-btn danger btn-secondary"
            onClick={() => rejectBlog(blog._id, rejectionReason)}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingBlogs;


