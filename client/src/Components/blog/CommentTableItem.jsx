import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import approveIcon from "../../assets/approveIcon.webp";
import deleteIcon from "../../assets/deleteIcon.webp";
const CommentTableItem = ({ comment, fetchComments }) => {
  const { _id, blog, content, createdAt, isApproved, user } = comment;
  const [loading, setLoading] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleDateString();

  const handleApprove = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/admin/approve/${_id}`);

      if (data.success) {
        toast.success("Comment Approved");
        fetchComments();
      }
    } catch {
      toast.error("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      setLoading(true);
      const { data } = await axios.delete(`/admin/comment/${_id}`);

      if (data.success) {
        toast.success("Comment Deleted");
        fetchComments();
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="comment-row">

      <td className="comment-info">
        <p><span className="label">Blog:</span> {blog?.title || "Deleted blog"}</p>
        <p><span className="label">User:</span> {user?.username || "Unknown"}</p>
        <p className="comment-text">{content}</p>
      </td>

      <td className="comment-date">{formattedDate}</td>

      <td className="comment-actions">

        {!isApproved ? (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="icon-btn approve"
          >
            <img src={approveIcon} alt="Approve" />
          </button>
        ) : (
          <span className="approved-badge">Approved</span>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className="icon-btn delete"
        >
          <img src={deleteIcon} alt="Delete" />
        </button>

      </td>

    </tr>
  );
};

export default CommentTableItem;

