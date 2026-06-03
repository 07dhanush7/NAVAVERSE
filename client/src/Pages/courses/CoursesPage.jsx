import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import CourseCard from "../../Components/courses/CourseCard";
import axios from "../../api/axios";
const CoursesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery);
  const [levelFilter, setLevelFilter] = useState("All");

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/courses/public");
        setCourses(data.items || data.courses || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesSearch = [course.title, course.description, course.instructor, course.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLevel = levelFilter === "All" || course.level === levelFilter;
        return matchesSearch && matchesLevel;
      }),
    [courses, levelFilter, searchQuery]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/courses?search=${encodeURIComponent(search)}` : "/courses");
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/courses");
  };

  return (
    <div className="jobs-page startups-page courses-page">
      <Navbar />

      <main className="catalog-page-shell">
        <section className="catalog-hero">
          <div className="catalog-hero-copy">
            <p className="jobs-eyebrow">NAVAVERSE Courses</p>
            <h1>Explore approved courses</h1>
            <p className="catalog-subtitle">
              Learn from creator-led video lessons, browse by level, and dive into practical
              learning built for the NAVAVERSE community.
            </p>
          </div>

          <div className="catalog-controls">
            <div className="catalog-filter-card">
              <label htmlFor="course-level-filter">Level</label>
              <select
                id="course-level-filter"
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option value="All">All levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <form className="catalog-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="catalog-search-actions">
                <button type="submit">Search</button>
                {search ? (
                  <button type="button" className="clear-btn" onClick={clearSearch}>
                    Clear
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        <section className="catalog-grid-section">
          {loading ? (
            <div className="catalog-empty-state">
              <p className="catalog-empty-title">Loading Courses</p>
              <p className="catalog-empty-copy">Preparing the latest approved learning content.</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="catalog-empty-state">
              <p className="catalog-empty-title">No Courses Available</p>
              <p className="catalog-empty-copy">Start learning by adding your first course.</p>
              <button type="button" className="catalog-empty-btn" onClick={() => navigate("/courses/add")}>
                Add Course
              </button>
            </div>
          ) : (
            <section className="catalog-grid">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;



