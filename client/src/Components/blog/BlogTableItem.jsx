import React from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
const BlogTableItem = ({ blog, fetchBlogs, index }) => {
  const { title, createdAt, isPublished, isFeatured, isUpcoming, _id } = blog;
  const blogDate = new Date(createdAt);

  /* ==========================
     DELETE BLOG
  ========================== */
  const deleteBlog = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (!confirmDelete) return;

    try {
      const { data } = await axios.delete(
        `/admin/blog/${_id}`
      );

      if (data.success) {
        toast.success(data.message);
        fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ==========================
     TOGGLE PUBLISH
  ========================== */
  const togglePublish = async () => {
    try {
      const { data } = await axios.put(
        `/blog/toggle/${_id}`
      );

      if (data.success) {
        toast.success(data.message);
        fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Publish toggle failed");
    }
  };

  /* ==========================
     TOGGLE FEATURED
  ========================== */
  const toggleFeatured = async () => {
    try {
      const { data } = await axios.put(`/blog/featured/${_id}`);
      if (data.success) {
        toast.success(data.message);
        fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Featured toggle failed");
    }
  };

  /* ==========================
     TOGGLE UPCOMING
  ========================== */
  const toggleUpcoming = async () => {
    try {
      const { data } = await axios.put(`/blog/upcoming/${_id}`);
      if (data.success) {
        toast.success(data.message);
        fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Upcoming toggle failed");
    }
  };

  return (
    <tr className="blog-row">
      <td>{index}</td>
      <td>{title}</td>
      <td>{blogDate.toDateString()}</td>

      <td>
        <span
          className={
            isPublished
              ? "status published"
              : "status draft"
          }
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </td>

      <td>
        <span className={isFeatured ? "status published" : "status draft"}>
          {isFeatured ? "Yes" : "No"}
        </span>
      </td>

      <td>
        <span className={isUpcoming ? "status published" : "status draft"}>
          {isUpcoming ? "Yes" : "No"}
        </span>
      </td>

      <td className="actions">
        <Link
          className="publish-btn"
          to={`/admin/editBlog/${_id}`}
        >
          Edit
        </Link>

        <button
          className="publish-btn"
          onClick={togglePublish}
        >
          {isPublished ? "Unpublish" : "Publish"}
        </button>

        <button
          className="publish-btn"
          onClick={toggleFeatured}
        >
          {isFeatured ? "Unfeature" : "Feature"}
        </button>

        <button
          className="publish-btn"
          onClick={toggleUpcoming}
        >
          {isUpcoming ? "Remove Upcoming" : "Mark Upcoming"}
        </button>

        <button
          className="delete-btn"
          onClick={deleteBlog}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default BlogTableItem;
