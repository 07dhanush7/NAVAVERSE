import { useEffect, useState } from "react";
import axios from "../../api/axios";
const Analytics = () => {
  const [categories, setCategories] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [calendar, setCalendar] = useState([]);

  const fetchData = async () => {
    try {
      const catRes = await axios.get("/admin/categories");
      const perfRes = await axios.get("/admin/performance");
      const calRes = await axios.get("/admin/calendar");

      setCategories(catRes.data.categories || []);
      setPerformance(perfRes.data.blogs || []);
      setCalendar(calRes.data.blogs || []);
    } catch (error) {
      console.error("Analytics Error:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, []);

  return (
    <div className="analytics-container">

      <h2>📊 Analytics Dashboard</h2>

      {/* ================= CATEGORY ANALYTICS ================= */}
      <div className="analytics-section">
        <h3>Category Distribution</h3>
        {categories.map((cat) => (
          <div key={cat._id} className="category-row">
            <span>{cat._id}</span>
            <span>{cat.count}</span>
          </div>
        ))}
      </div>

      {/* ================= PERFORMANCE TABLE ================= */}
      <div className="analytics-section">
        <h3>Blog Performance</h3>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {performance.map((blog) => (
              <tr key={blog._id}>
                <td>{blog.title}</td>
                <td>{blog.views}</td>
                <td>{blog.likes}</td>
                <td>
                  {blog.isPublished ? "Published" : "Draft"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CALENDAR VIEW ================= */}
      <div className="analytics-section">
        <h3>Content Calendar</h3>

        {calendar.map((blog) => (
          <div key={blog._id} className="calendar-row">
            <span>
              {new Date(blog.createdAt).toDateString()}
            </span>
            <span>{blog.title}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Analytics;

