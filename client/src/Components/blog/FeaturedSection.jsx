import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import BlogCard from "./BlogCard";
const FeaturedSection = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    window.scrollTo(0, 0);

    const load = async () => {
      try {

        const { data } = await axios.get("/blog/featured");

        if (data.success) {
          setBlogs(data.blogs.slice(0, 3));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();

  }, []);

  if (loading) {
    return (
      <div className="featured-wrapper">
        <div className="featured-header">
          <h2 className="featured-title">
            Editor's Picks
          </h2>
          <p className="featured-subtitle">
            Handpicked stories and insights from our most engaging writers.
          </p>
          <Link to="/featured" className="featured-link">
            Explore More →
          </Link> 
        </div>
        <div className="featured-loading">
          Loading featured blogs...
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="featured-section">
      <div className="section-title">
        <h2>Editor's Picks</h2>
        <p className="section-desc">
          Selected blogs that highlight powerful ideas, unique perspectives, and engaging discussions.
        </p>
        <Link to="/featured" className="see-all">
          Explore More →
        </Link>
      </div>
      <div className="featured-grid">
        {blogs.map((b) => (
          <BlogCard key={b._id} blog={b} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedSection;



