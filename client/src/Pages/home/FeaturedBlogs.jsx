import React, { useEffect, useState } from "react";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import BlogCard from "../../Components/blog/BlogCard";
import axios from "../../api/axios";
const FeaturedBlogs = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0,0);

    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get("/blog/featured");

        if (data.success) {
          setBlogs(data.blogs);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="featured-page-wrapper">
      <Navbar />
      <section className="featured-header-section">
        <h2 className="featured-page-title">
          Editor's Picks
        </h2>
      </section>
      <section className="featured-blog-grid">
        {loading ? (
          <p className="featured-loading-text">
            Loading...
          </p>
        ) : blogs.length ? (
          blogs.map((b) => (
            <BlogCard key={b._id} blog={b} />
          ))
        ) : (
          <p className="featured-empty-text">
            No featured blogs yet.
          </p>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default FeaturedBlogs;

