import { useCallback, useEffect, useState } from "react";
import axios from "../../api/axios";
const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [collectionCounts, setCollectionCounts] = useState({
    blogs: 0,
    jobs: 0,
    events: 0,
    startups: 0,
    courses: 0,
  });
  const [categories, setCategories] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [
        statsRes,
        catRes,
        perfRes,
        calRes,
        notifRes,
        blogRes,
        jobRes,
        eventRes,
        startupRes,
        courseRes,
      ] = await Promise.all([
        axios.get("/admin/dashboard"),
        axios.get("/admin/categories"),
        axios.get("/admin/performance"),
        axios.get("/admin/calendar"),
        axios.get("/subscription/notifications"),
        axios.get("/blog/admin/all"),
        axios.get("/jobs/admin/all"),
        axios.get("/events/admin/all"),
        axios.get("/startups/admin/all"),
        axios.get("/courses/admin/all"),
      ]);

      setStats(statsRes.data.dashboardData || {});
      setCategories(catRes.data.categories || []);
      setPerformance(perfRes.data.blogs || []);
      setCalendar(calRes.data.blogs || []);
      setNotifications(notifRes.data.notifications || []);
      setCollectionCounts({
        blogs: blogRes.data.blogs?.length || blogRes.data.items?.length || 0,
        jobs: jobRes.data.items?.length || jobRes.data.jobs?.length || 0,
        events: eventRes.data.items?.length || eventRes.data.events?.length || 0,
        startups: startupRes.data.items?.length || 0,
        courses: courseRes.data.items?.length || 0,
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/subscription/notification/read/${id}`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark Read Error:", error);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, [fetchData]);

  const summaryCards = [
    { label: "Total Blogs", value: collectionCounts.blogs, accent: "sky" },
    { label: "Total Jobs", value: collectionCounts.jobs, accent: "indigo" },
    { label: "Total Events", value: collectionCounts.events, accent: "teal" },
    { label: "Total Startups", value: collectionCounts.startups, accent: "amber" },
    { label: "Total Courses", value: collectionCounts.courses, accent: "rose" },
  ];

  return (
    <div className="dashboard-container">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Control Center</p>
          <h2>Admin Dashboard</h2>
          <p className="page-description">
            Track activity across blogs, jobs, events, startups, and courses from one clean workspace.
          </p>
        </div>
      </div>

      <div className="stats-grid admin-summary-grid">
        {summaryCards.map((item) => (
          <article key={item.label} className={`stat-card stat-card-${item.accent}`}>
            <p className="stat-card-label">{item.label}</p>
            <h3>{item.value ?? 0}</h3>
            <span className="stat-card-caption">Live platform overview</span>
          </article>
        ))}
      </div>

      <div className="stats-grid admin-insights-grid">
        <article className="stat-card stat-card-secondary">
          <p className="stat-card-label">Comments</p>
          <h3>{stats.totalComments ?? 0}</h3>
          <span className="stat-card-caption">Community responses</span>
        </article>
        <article className="stat-card stat-card-secondary">
          <p className="stat-card-label">Draft Blogs</p>
          <h3>{stats.drafts ?? 0}</h3>
          <span className="stat-card-caption">Waiting for publish</span>
        </article>
        <article className="stat-card stat-card-secondary">
          <p className="stat-card-label">Published Blogs</p>
          <h3>{stats.published ?? 0}</h3>
          <span className="stat-card-caption">Already public</span>
        </article>
        <article className="stat-card stat-card-secondary">
          <p className="stat-card-label">Subscribers</p>
          <h3>{stats.totalSubscribers ?? 0}</h3>
          <span className="stat-card-caption">Newsletter audience</span>
        </article>
      </div>

      <div className="admin-dashboard-split">
        <div className="section">
          <div className="section-heading">
            <div>
              <h3>Recent Notifications</h3>
              <p className="section-subtitle">Keep up with new subscriber and platform updates.</p>
            </div>
          </div>

          <div className="admin-list-stack">
            {notifications.length === 0 ? (
              <p className="empty">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`admin-list-row ${notif.isRead ? "read" : "unread"}`}
                >
                  <div>
                    <strong>{notif.message}</strong>
                    <p>{notif.isRead ? "Reviewed" : "Needs attention"}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="job-action-btn secondary"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-heading">
            <div>
              <h3>Category Analytics</h3>
              <p className="section-subtitle">Top content mix from the blog module.</p>
            </div>
          </div>

          <div className="admin-list-stack">
            {categories.length === 0 ? (
              <p className="empty">No categories found</p>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="admin-list-row compact">
                  <strong>{cat._id}</strong>
                  <span className="badge status-approved">{cat.count} items</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Blog Performance</h3>
            <p className="section-subtitle">Most important engagement and publishing details in one table.</p>
          </div>
        </div>

        <div className="dashboard-table-wrap">
          <table className="performance-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {performance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No blog data available
                  </td>
                </tr>
              ) : (
                performance.map((blog) => (
                  <tr key={blog._id}>
                    <td>{blog.title}</td>
                    <td>{blog.views ?? 0}</td>
                    <td>{Array.isArray(blog.likes) ? blog.likes.length : 0}</td>
                    <td>
                      <div className="dashboard-rating">
                        <span className="dashboard-rating-star">&#9733;</span>
                        <span>
                          {blog.avgRating || 0} ({blog.totalRatings || 0})
                        </span>
                      </div>
                    </td>
                    <td>
                      {blog.isPublished ? (
                        <span className="badge published">Published</span>
                      ) : (
                        <span className="badge draft">Draft</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Content Calendar</h3>
            <p className="section-subtitle">Recent publication activity from the blog pipeline.</p>
          </div>
        </div>

        <div className="admin-list-stack">
          {calendar.length === 0 ? (
            <p className="empty">No calendar data</p>
          ) : (
            calendar.map((blog) => (
              <div key={blog._id} className="admin-list-row">
                <div>
                  <strong>{blog.title}</strong>
                  <p>{new Date(blog.createdAt).toDateString()}</p>
                </div>
                <span className="badge draft">Scheduled Entry</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


