import { assetUrl } from "../../api/axios";
import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Course";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const imageUrl = course?.image
    ? course.image.startsWith("http")
      ? course.image
      : assetUrl(encodeURI(course.image))
    : fallbackImage;

  const description = isAuthenticated
    ? course?.description?.length > 130
      ? `${course.description.slice(0, 130)}...`
      : course?.description || "Explore a new hands-on course from the NAVAVERSE community."
    : "Please login to access full content";

  const createdAt = course?.createdAt
    ? new Date(course.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently added";

  const tags = [course?.category, course?.level].filter(Boolean);

  const openCourse = () => navigate(`/courses/${course._id}`);

  return (
    <article
      className="blog-card course-card"
      onClick={openCourse}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCourse();
        }
      }}
    >
      <div className="blog-image course-card-image">
        <img
          src={imageUrl}
          alt={course?.title || "Course"}
          loading="lazy"
          decoding="async"
          width="1200"
          height="720"
        />
        {tags.length ? (
          <div className="blog-tags">
            {tags.map((tag) => (
              <span key={tag} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="blog-card-content">
        <div className="course-card-top">
          <h3>{course?.title}</h3>
          <p>{description}</p>
        </div>

        {!isAuthenticated ? (
          <div className="card-access-note">
            <span>Please login to access full content</span>
            <Link
              to="/login"
              className="card-access-link"
              onClick={(event) => event.stopPropagation()}
            >
              Login
            </Link>
          </div>
        ) : null}

        <div className="course-card-details">
          <span>Instructor: {course?.instructor || "NAVAVERSE"}</span>
          <span>Duration: {course?.duration || "Self-paced"}</span>
          <span>Level: {course?.level || "Beginner"}</span>
        </div>

        <div className="blog-card-footer course-card-footer">
          <div className="blog-meta">
            <span>{createdAt}</span>
            <span>&bull;</span>
            <span>{course?.lessonCount || 0} lessons</span>
          </div>

          <Link
            to={`/courses/${course._id}`}
            className="course-view-btn card-access-link"
            onClick={(event) => event.stopPropagation()}
          >
            {isAuthenticated ? "View Details" : "Preview"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default memo(CourseCard);


