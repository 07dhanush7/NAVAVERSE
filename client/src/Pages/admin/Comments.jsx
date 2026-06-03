import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import CommentTableItem from "../../Components/blog/CommentTableItem";
const Comments = () => {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("Not Approved");

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await axios.get("/admin/comments");
      if (data.success) {
        setComments(data.comments);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to fetch comments");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchComments();
    };
    init();
  }, [fetchComments]);

  const filteredComments = comments.filter((comment) =>
    filter === "Approved" ? comment.isApproved : !comment.isApproved
  );

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Comment Management</h3>
            <p className="section-subtitle">
              Review community conversation, approve what should go live, and remove what does not belong.
            </p>
          </div>
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn btn-secondary ${filter === "Approved" ? "active" : ""}`}
            onClick={() => setFilter("Approved")}
          >
            Approved
          </button>
          <button
            className={`filter-btn btn-primary ${filter === "Not Approved" ? "active" : ""}`}
            onClick={() => setFilter("Not Approved")}
          >
            Pending Review
          </button>
        </div>

        <div className="comments-table-wrapper dashboard-table-wrap">
          <table className="comments-table performance-table">
            <thead>
              <tr>
                <th>Blog & Comment Content</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length > 0 ? (
                filteredComments.map((comment, index) => (
                  <CommentTableItem
                    key={comment._id}
                    comment={comment}
                    index={index + 1}
                    fetchComments={fetchComments}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-state empty">
                    No {filter.toLowerCase()} comments found.
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

export default Comments;


