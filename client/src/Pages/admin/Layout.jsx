import React, { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import Sidebar from "../../Components/admin/Sidebar";
const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminLabel = useMemo(() => {
    return localStorage.getItem("adminEmail") || "NAVAVERSE Admin";
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-wrapper">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label={sidebarOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className="admin-brand"
            onClick={() => navigate("/")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                navigate("/");
              }
            }}
            role="button"
            tabIndex={0}
          >
            <img src={assets.logo} alt="NAVAVERSE logo" className="admin-logo" />
            <div className="admin-brand-copy">
              <span className="admin-brand-kicker">Admin Panel</span>
              <strong>NAVAVERSE Dashboard</strong>
            </div>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <div className="admin-profile-chip">
            <span className="admin-profile-label">Signed in as</span>
            <strong>{adminLabel}</strong>
          </div>

          <button className="admin-logout-btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        <Sidebar sidebarOpen={sidebarOpen} onNavigate={closeSidebar} />
        {sidebarOpen ? (
          <button
            type="button"
            className="admin-sidebar-backdrop"
            onClick={closeSidebar}
            aria-label="Close sidebar overlay"
          />
        ) : null}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;



