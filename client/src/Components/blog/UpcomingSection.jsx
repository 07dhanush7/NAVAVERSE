import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import BlogCard from "./BlogCard";
const UpcomingSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/blog/upcoming");
        if (data.success) setBlogs(data.blogs.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <div className="upcoming-section">
      <div className="section-title">
        <h2>Future Reads</h2>

        <p className="section-descup">
          Discover blogs that will soon be published on NAVAVERSE. Stay tuned for
          fresh ideas, insightful stories, and exciting discussions.
        </p>

        <Link to="/upcoming" className="see-all">
          See All →
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">Loading upcoming blogs...</div>
      ) : (
        <div className="upcoming-grid">
          {blogs.map((b) => (
            <BlogCard key={b._id} blog={b} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingSection;



