import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios, { assetUrl } from "../../../api/axios";
import StatusBadge from "../../../Components/content/StatusBadge";

const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Course";

const AdminCourseRequests = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    const fetchPendingCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/courses/admin/pending");
        setCourses(data.items || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load pending courses");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCourses();
  }, []);

  const handleApprove = async (courseId) => {
    try {
      const { data } = await axios.put(`/courses/admin/approve/${courseId}`);
      setCourses((current) => current.filter((course) => course._id !== courseId));
      toast.success(data.message || "Course approved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve course");
    }
  };

  const handleReject = async (courseId) => {
    try {
      const { data } = await axios.put(`/courses/admin/reject/${courseId}`, {
        rejectionReason: reasons[courseId] || "",
      });
      setCourses((current) => current.filter((course) => course._id !== courseId));
      toast.success(data.message || "Course rejected successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject course");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Course Requests</h3>
            <p className="section-subtitle">
              Review submitted courses and approve only the ones ready for public learning.
            </p>
          </div>
        </div>

        <div className="approval-card-grid">
          {loading ? (
            <div className="empty">Loading pending courses...</div>
          ) : courses.length === 0 ? (
            <div className="empty">No pending courses found</div>
          ) : (
            courses.map((course) => (
              <article key={course._id} className="approval-content-card">
                <img
                  src={
                    course.image
                      ? assetUrl(course.image)
                      : fallbackImage
                  }
                  alt={course.title}
                  className="approval-card-image"
                />

                <div className="approval-card-body">
                  <p className="approval-card-kicker">{course.category}</p>
                  <h4>{course.title}</h4>
                  <p className="approval-card-copy">
                    {course.description || "No course description was provided."}
                  </p>

                  <div className="approval-card-meta">
                    <span>{course.instructor || "NAVAVERSE"}</span>
                    <span>{course.duration || "Self-paced"}</span>
                    <span>{course.level || "Beginner"}</span>
                    <span>{course.lessonCount || 0} lessons</span>
                    <span>{course.creatorName || "Unknown User"}</span>
                    <StatusBadge status={course.status || "pending"} />
                  </div>

                  <div className="approval-actions">
                    <textarea
                      className="approval-reason"
                      placeholder="Optional rejection reason"
                      value={reasons[course._id] || ""}
                      onChange={(event) =>
                        setReasons((current) => ({
                          ...current,
                          [course._id]: event.target.value,
                        }))
                      }
                      rows="3"
                    />

                    <div className="job-table-actions">
                      <button type="button" className="job-action-btn primary" onClick={() => handleApprove(course._id)}>
                        Approve
                      </button>
                      <button type="button" className="job-action-btn danger" onClick={() => handleReject(course._id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseRequests;


