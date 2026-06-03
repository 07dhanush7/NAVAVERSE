import React, { useEffect, useState } from "react";

import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import BlogCard from "../../Components/blog/BlogCard";
import axios from "../../api/axios";
const UpcomingBlogs = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get("/blog/upcoming");

        if (data.success) {
          setBlogs(data.blogs);
        }

      } catch (error) {
        console.error("Error fetching upcoming blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="upcoming-page-wrapper">
      <Navbar />
      <div className="upcoming-header-section">
        <h2 className="upcoming-page-title">Future Reads</h2>
      </div>
      <div className="upcoming-blog-grid">
        {loading ? (
          <p className="upcoming-loading-text">Loading...</p>
        ) : blogs.length ? (
          blogs.map((b) => <BlogCard key={b._id} blog={b} />)
        ) : (
          <p className="upcoming-empty-text">No upcoming blogs yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );

};

export default UpcomingBlogs;

