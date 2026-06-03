import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
const menuGroups = [
  {
    heading: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: assets.home_icon, end: true },
    ],
  },
  {
    heading: "Content",
    items: [
      { to: "/admin/addBlog", label: "Blogs", icon: assets.blog_icon },
      { to: "/admin/jobs", label: "Jobs", icon: assets.list_icon },
      { to: "/admin/events", label: "Events", icon: assets.list_icon },
      { to: "/admin/startups", label: "Startups", icon: assets.add_icon },
      { to: "/admin/courses", label: "Courses", icon: assets.list_icon },
    ],
  },
  {
    heading: "Inbox",
    items: [
      { to: "/admin/comments", label: "Comments", icon: assets.comment_icon },
    ],
  },
];

const quickLinks = [
  { to: "/admin/listBlog", label: "Manage Blog List" },
  { to: "/admin/pending-blogs", label: "Blog Requests" },
  { to: "/admin/jobs/approvals", label: "Job Requests" },
  { to: "/admin/events/approvals", label: "Event Requests" },
  { to: "/admin/startups/approvals", label: "Startup Approvals" },
  { to: "/admin/startups/requests", label: "Startup Requests" },
  { to: "/admin/courses/requests", label: "Course Requests" },
];

const Sidebar = ({ sidebarOpen = false, onNavigate = () => {} }) => {
  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="admin-sidebar-inner">
        {menuGroups.map((group) => (
          <div key={group.heading} className="sidebar-group">
            <p className="sidebar-group-title">{group.heading}</p>
            <div className="sidebar-links">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  end={item.end}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                >
                  <img src={item.icon} alt={item.label} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className="sidebar-quick-actions">
          <p className="sidebar-group-title">Requests & Lists</p>
          <div className="sidebar-secondary-links">
            {quickLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `sidebar-secondary-link ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

