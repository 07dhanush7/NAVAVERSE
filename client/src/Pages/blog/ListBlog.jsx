import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import BlogTableItem from "../../Components/blog/BlogTableItem";
const ListBlog = () => {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = useCallback(async () => {
    try {
      const { data } = await axios.get("/admin/blogs");

      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to fetch blogs");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchBlogs();
    };
    init();
  }, [fetchBlogs]);

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Blogs</h3>
            <p className="section-subtitle">
              Manage publication state, feature visibility, and upcoming highlights from one list.
            </p>
          </div>
        </div>

        <div className="table-wrapper dashboard-table-wrap">
          <table className="blog-table performance-table">
            <thead>
              <tr>
                <th>SL NO</th>
                <th>Blog Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Upcoming</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {blogs.length > 0 ? (
                blogs.map((blog, index) => (
                  <BlogTableItem
                    key={blog._id}
                    blog={blog}
                    index={index + 1}
                    fetchBlogs={fetchBlogs}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data empty">
                    No blogs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListBlog;


