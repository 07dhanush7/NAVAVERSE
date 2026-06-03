import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import CourseCard from "./CourseCard";
const FeaturedCoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("/courses/public", {
          params: { limit: 3 },
        });
        setCourses(data.items || data.courses || []);
      } catch (error) {
        console.error("Featured courses fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="featured-courses-section">
        <div className="featured-courses-title-box">
          <h2>Featured Courses</h2>
          <p className="featured-courses-desc">
            Learn through approved video-first courses built for the NAVAVERSE community.
          </p>
        </div>
        <div className="featured-courses-loading">Loading featured courses...</div>
      </section>
    );
  }

  if (!courses.length) {
    return null;
  }

  return (
    <section className="featured-courses-section">
      <div className="featured-courses-title-box">
        <h2>Featured Courses</h2>
        <p className="featured-courses-desc">
          Learn through approved video-first courses built for the NAVAVERSE community.
        </p>

        <Link to="/courses" className="featured-courses-see-all">
          View All Courses
        </Link>
      </div>

      <div className="featured-courses-grid">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;



