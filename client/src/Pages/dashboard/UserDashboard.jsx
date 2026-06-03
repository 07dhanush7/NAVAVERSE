import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import axios from "../../api/axios";
import StatusBadge from "../../Components/content/StatusBadge";
const dashboardSections = [
  { key: "blogs", label: "Blogs" },
  { key: "jobs", label: "Jobs" },
  { key: "events", label: "Events" },
  { key: "startups", label: "Startups" },
  { key: "courses", label: "Courses" },
];

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    blogs: [],
    jobs: [],
    events: [],
    startups: [],
    courses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/dashboard/user");

        setDashboardData({
          blogs: data.blogs || [],
          jobs: data.jobs || [],
          events: data.events || [],
          startups: data.startups || [],
          courses: data.courses || [],
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalSubmissions = useMemo(
    () =>
      dashboardSections.reduce((count, section) => count + (dashboardData[section.key]?.length || 0), 0),
    [dashboardData]
  );

  return (
    <div className="user-dashboard-page">
      <Navbar />

      <main className="user-dashboard-main">
        <section className="user-dashboard-hero">
          <div>
            <p className="user-dashboard-kicker">Creator Dashboard</p>
            <h1>Track your submissions across NAVAVERSE</h1>
            <p>
              Review approval progress for your blog, job, event, startup, and course submissions
              in one place.
            </p>
          </div>
          <div className="user-dashboard-stat card">
            <div className="card-content">
              <span>Total submissions</span>
              <strong>{loading ? "..." : totalSubmissions}</strong>
            </div>
          </div>
        </section>

        {dashboardSections.map((section) => (
          <section key={section.key} className="user-dashboard-section card">
            <div className="card-content">
              <div className="user-dashboard-section-header">
                <h2>{section.label}</h2>
                <span>{dashboardData[section.key]?.length || 0} items</span>
              </div>

              {loading ? (
                <div className="user-dashboard-empty">Loading {section.label.toLowerCase()}...</div>
              ) : dashboardData[section.key]?.length ? (
                <div className="user-dashboard-list">
                  {dashboardData[section.key].map((item) => (
                    <article key={item._id || item.id} className="user-dashboard-item">
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.type || section.label.slice(0, -1)} submission</p>
                        {item.rejectionReason ? (
                          <p className="user-dashboard-reason">Reason: {item.rejectionReason}</p>
                        ) : null}
                      </div>
                      <div className="user-dashboard-item-meta">
                        <StatusBadge status={item.status || "pending"} />
                        <span>
                          {new Date(item.createdAt || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="user-dashboard-empty">
                  No {section.label.toLowerCase()} submissions yet.
                </div>
              )}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;


