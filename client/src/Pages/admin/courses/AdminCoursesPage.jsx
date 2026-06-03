import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios, { assetUrl } from "../../../api/axios";
import CourseBuilderForm from "../../../Components/courses/CourseBuilderForm";
const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Course";

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/courses/admin/all");
      setCourses(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const approvedCourses = useMemo(
    () => courses.filter((course) => course.status === "approved"),
    [courses]
  );

  const handleDelete = async (courseId) => {
    try {
      setDeletingId(courseId);
      const { data } = await axios.delete(`/courses/admin/delete/${courseId}`);
      setCourses((current) => current.filter((course) => course._id !== courseId));
      toast.success(data.message || "Course deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="section-heading">
          <div>
            <h3>All Courses</h3>
            <p className="section-subtitle">
              Create admin courses that go live immediately and manage all approved course content.
            </p>
          </div>
        </div>

        <div className="job-dashboard-grid admin-course-grid">
          <div className="job-dashboard-form admin-course-form-wrap">
            <h4>Add Course as Admin</h4>
            <CourseBuilderForm
              apiPath="/courses/admin/create"
              submitLabel="Create Course"
              formClassName="admin-course-form"
              onSuccess={fetchCourses}
            />
          </div>

          <div className="job-dashboard-panel">
            <div className="panel-header">
              <h4>Approved Courses</h4>
              <p>{approvedCourses.length} live courses</p>
            </div>

            {loading ? (
              <div className="empty">Loading approved courses...</div>
            ) : approvedCourses.length === 0 ? (
              <div className="empty">No approved courses found.</div>
            ) : (
              <div className="approval-card-grid">
                {approvedCourses.map((course) => (
                  <article key={course._id} className="approval-content-card">
                    <img
                      src={course.image ? assetUrl(course.image) : fallbackImage}
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
                        <span>{course.creatorName || "Admin"}</span>
                      </div>

                      <div className="job-table-actions">
                        <Link to={`/courses/${course._id}`} className="job-action-btn secondary">
                          View
                        </Link>
                        <button
                          type="button"
                          className="job-action-btn danger"
                          onClick={() => handleDelete(course._id)}
                          disabled={deletingId === course._id}
                        >
                          {deletingId === course._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;


