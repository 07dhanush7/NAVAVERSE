import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axios from "../../api/axios";
import BlogCard from "./BlogCard";
const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the latest published blogs for the homepage section.
  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get("/blog");

      if (data?.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs.slice(0, 3));
      }
    } catch (error) {
      console.error("Blog fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="blog-landing-section">
        <div className="blog-landing-title-box">
          <h2>Latest Insights & Blogs</h2>
          <p className="blog-landing-desc">
            Discover ideas, technology insights, and stories from creators
            building the future.
          </p>
        </div>

        <div className="blog-loading-state">Loading latest blogs...</div>
      </section>
    );
  }

  if (!blogs.length) return null;

  return (
    <section className="blog-landing-section">
      <div className="blog-landing-title-box">
        <h2>Latest Insights & Blogs</h2>
        <p className="blog-landing-desc">
          Discover ideas, technology insights, and stories from creators
          building the future.
        </p>

        <Link to="/blogs" className="blog-landing-see-all">
          View All Blogs →
        </Link>
      </div>

      <div className="blog-landing-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default BlogSection;



