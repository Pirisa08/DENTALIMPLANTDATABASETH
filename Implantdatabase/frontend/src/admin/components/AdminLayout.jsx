import React, { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { loadMaster, MASTER_TYPES } from "../pages/masterDataStore.js";
import "./AdminLayout.css";
import "../pages/MasterData.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [showAddIntro, setShowAddIntro] = useState(false);
  const [addType, setAddType] = useState(null);
  const [master, setMaster] = useState(() => {
    try {
      return loadMaster();
    } catch (error) {
      console.error("Error loading master data:", error);
      return {};
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const refresh = () => {
      try {
        setMaster(loadMaster());
      } catch (error) {
        console.error("Error refreshing master data:", error);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const masterTypes = useMemo(() => {
    return MASTER_TYPES.map((t) => ({
      ...t,
      total: Array.isArray(master[t.key]) ? master[t.key].length : 0,
    }));
  }, [master]);

  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  
  const profileData = (() => {
    try {
      return JSON.parse(localStorage.getItem("admin_profile_v1") || "{}");
    } catch {
      return {};
    }
  })();

  return (
    <div className="adminShell">
      {/* Hamburger Menu Button */}
      <button 
        className={`hamburgerBtn ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      <div 
        className={`sidebarOverlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <button
          className="profile profileBtn"
          onClick={() => navigate("/admin/profile")}
          type="button"
          title="Go to profile"
        >
          <div className="avatar">
            {profileData.profileImage ? (
              <img src={profileData.profileImage} alt="profile" className="avatarImg" />
            ) : (
              "🧑"
            )}
          </div>
          <div className="profileText">
            <div className="name">{user.name || "Min admin"}</div>
            <div className="role">Admin</div>
          </div>
        </button>

        <div className="menuTitle">Features</div>
        <NavLink
         to="/admin/dashboard"
         className={({ isActive }) => (isActive ? "navItem active" : "navItem")}
         onClick={closeSidebar}
         >
          📊 Dashboard
        </NavLink>


        <div className="menuTitle">Management</div>
        <nav className="nav">
          <NavLink
            to="/admin/implants"
            className={({ isActive }) => (isActive ? "navItem active" : "navItem")}
            onClick={closeSidebar}
          >
            🦷 Implants
          </NavLink>
          <NavLink 
          to="/admin/blog"
          className={({ isActive }) => (isActive ? "navItem active" : "navItem")}
          onClick={closeSidebar}
          >
            📝 Blog
          </NavLink>
          <NavLink
            to="/admin/feedback"
            className={({ isActive }) => (isActive ? "navItem active" : "navItem")}
            onClick={closeSidebar}
          >
            📬 Feedback
          </NavLink>

          <div className="masterDropdown">
            <button
              className={`navItem masterToggle ${location.pathname.startsWith("/admin/master") ? "active" : ""}`}
              onClick={() => setMasterOpen(!masterOpen)}
            >
              <span>🗂️ Master Data</span>
              <span className="dropIcon">{masterOpen ? "−" : "+"}</span>
            </button>
            {masterOpen && (
              <div className="masterList">
                {masterTypes.map((t) => (
                  <div key={t.key} className="masterItemRow">
                    <NavLink
                      to={`/admin/master/${t.key}`}
                      className={({ isActive }) => (isActive ? "masterItem active" : "masterItem")}
                      onClick={closeSidebar}
                    >
                      <span className="masterLabel">{t.label}</span>
                      <span className="masterCount">{t.total}</span>
                    </NavLink>
                    <button
                      className="sidebarAddBtn"
                      title={`Add ${t.label}`}
                      onClick={() => {
                        setAddType(t.key);
                        setShowAddIntro(true);
                      }}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <button className="logoutBtn" onClick={handleLogout}>
          Log Out
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>

      {showAddIntro && (
        <div className="modalOverlay" onClick={() => setShowAddIntro(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h3 className="modalTitle">Add New {MASTER_TYPES.find(t => t.key === addType)?.label || "Item"}</h3>
              <button className="modalClose" onClick={() => setShowAddIntro(false)}>×</button>
            </div>
            <div className="modalBody">
              <p className="modalText">Preview recent items to reduce duplicates before adding.</p>
              <div className="mdPreviewList">
                {(Array.isArray(master[addType]) ? master[addType].slice(0, 3) : []).map((x) => (
                  <div className="mdPreviewRow" key={x.id}>
                    <span className="dot" />
                    <div className="previewText">{x.name}</div>
                    <div className="statusTiny">{x.status === "Active" ? "Open" : "Closed"}</div>
                  </div>
                ))}
                {(!Array.isArray(master[addType]) || master[addType]?.length === 0) && (
                  <div className="empty">No items yet.</div>
                )}
              </div>
            </div>
            <div className="modalActions">
              <button
                className="btn save"
                onClick={() => {
                  setShowAddIntro(false);
                  navigate(`/admin/master/${addType}/new`);
                }}
                disabled={!addType}
              >
                Continue
              </button>
              <button className="btn cancel" onClick={() => setShowAddIntro(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
