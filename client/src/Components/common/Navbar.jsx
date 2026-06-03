import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PencilLine,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import axios, { assetUrl } from "../../api/axios";
import Logo from "../../assets/Logo.webp";
const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const isAuthenticated = Boolean(user);
  const profileImage = user?.profileImage
    ? assetUrl(user.profileImage)
    : "https://i.imgur.com/6VBx3io.png";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Blogs", to: "/blogs" },
    { label: "Jobs", to: "/jobs" },
    { label: "Events", to: "/events" },
    { label: "Courses", to: "/courses" },
    { label: "Startups", to: "/startups" },
  ];

  const moreNavItems = [
    { label: "Services", to: "/services" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const profileItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "My Posts", to: "/write-blog", icon: PencilLine },
    { label: "My Applicants", to: "/jobs/my-applicants", icon: Users },
    { label: "Startup Requests", to: "/startups/requests", icon: Users },
  ];

  const closeAllMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
    setMoreOpen(false);
    setMobileMoreOpen(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const { data } = await axios.put("/users/profile", formData);

      if (data) {
        toast.success("Profile photo updated");
        setTimeout(() => window.location.reload(), 700);
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="navbar-shell">
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={closeAllMenus}>
          <span className="navbar-brand-mark">
            <img src={Logo} alt="NAVAVERSE logo" />
          </span>
          <span className="navbar-brand-copy">
            <strong>NAVAVERSE</strong>
            <small>Build. Learn. Launch.</small>
          </span>
        </Link>

        <div className="navbar-desktop">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}

          <div className={`navbar-item navbar-dropdown ${moreOpen ? "open" : ""}`} ref={moreRef}>
            <button
              type="button"
              className={`navbar-link ${moreNavItems.some((item) => item.to === location.pathname) ? "active" : ""}`}
              onClick={() => setMoreOpen((current) => !current)}
              aria-expanded={moreOpen}
            >
              <span>More</span>
              <ChevronDown size={15} />
            </button>

            <div className="navbar-dropdown-menu">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={closeAllMenus}
                  className={({ isActive }) => `nav-dropdown-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="navbar-auth desktop-only">
          {!loading && !isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-action-link navbar-action-secondary">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="navbar-action-link navbar-action-primary">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          ) : (
            <div className="navbar-profile" ref={profileRef}>
              <button
                type="button"
                className="navbar-profile-trigger"
                onClick={() => setProfileOpen((current) => !current)}
              >
                <img src={profileImage} alt="Profile" className="navbar-avatar" />
                <span className="navbar-profile-copy">
                  <strong>{user?.username}</strong>
                  <small>{user?.email}</small>
                </span>
                <ChevronDown size={16} />
              </button>

              <div className={`navbar-profile-menu ${profileOpen ? "open" : ""}`}>
                <div className="navbar-profile-card">
                  <button
                    type="button"
                    className="navbar-profile-photo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img src={profileImage} alt="Profile" />
                  </button>
                  <div>
                    <strong>{user?.username}</strong>
                    <small>{user?.email}</small>
                    <button
                      type="button"
                      className="navbar-inline-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Update photo
                    </button>
                  </div>
                </div>

                <div className="navbar-profile-links">
                  {profileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} to={item.to} onClick={closeAllMenus} className="navbar-profile-link">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <button type="button" className="navbar-profile-link danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <div className={`navbar-mobile-panel ${mobileOpen ? "open" : ""}`}>
        <div className="navbar-mobile-links">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={closeAllMenus}
              className={({ isActive }) => `navbar-mobile-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}

          <div className={`navbar-mobile-dropdown ${mobileMoreOpen ? "open" : ""}`}>
            <button
              type="button"
              className={`navbar-mobile-link ${moreNavItems.some((item) => item.to === location.pathname) ? "active" : ""}`}
              onClick={() => setMobileMoreOpen((current) => !current)}
              aria-expanded={mobileMoreOpen}
            >
              <span>More</span>
              <ChevronDown size={16} />
            </button>

            <div className="navbar-mobile-submenu">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={closeAllMenus}
                  className={({ isActive }) => `nav-dropdown-link mobile ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="navbar-mobile-auth">
          {!loading && !isAuthenticated ? (
            <div className="navbar-mobile-action-row">
              <Link to="/login" className="navbar-action-link navbar-action-secondary" onClick={closeAllMenus}>
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="navbar-action-link navbar-action-primary"
                onClick={closeAllMenus}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          ) : (
            <div className="navbar-mobile-user">
              <div className="navbar-profile-card">
                <button
                  type="button"
                  className="navbar-profile-photo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={profileImage} alt="Profile" />
                </button>
                <div>
                  <strong>{user?.username}</strong>
                  <small>{user?.email}</small>
                </div>
              </div>

              <div className="navbar-profile-links">
                {profileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} to={item.to} onClick={closeAllMenus} className="navbar-profile-link">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button type="button" className="navbar-profile-link danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="navbar-hidden-input"
        onChange={handleImageUpload}
      />
    </header>
  );
};

export default Navbar;


