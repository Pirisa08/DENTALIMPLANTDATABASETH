import React, { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { loadMaster, MASTER_TYPES } from "../pages/masterDataStore.js";
import "./AdminLayout.css";
import "../pages/MasterData.css";

const readAdminUser = () => {
  try {
    const raw = localStorage.getItem("admin_user");
    if (!raw) {
      return {
        name: "Min admin",
        username: "admin",
        role: "admin",
        image_url: "",
      };
    }

    const parsed = JSON.parse(raw);

    return {
      id: parsed?.id ?? null,
      name: parsed?.name || parsed?.username || "Min admin",
      username: parsed?.username || "admin",
      email: parsed?.email || "",
      role: parsed?.role || "admin",
      image_url: parsed?.image_url || "",
    };
  } catch (error) {
    console.error("Failed to read admin_user:", error);
    return {
      name: "Min admin",
      username: "admin",
      role: "admin",
      image_url: "",
    };
  }
};

const formatRole = (role) => {
  if (!role) return "Admin";
  const normalized = String(role).toLowerCase();

  if (normalized === "admin") return "Admin";
  if (normalized === "editor") return "Editor";
  if (normalized === "distributor") return "Distributor";
  if (normalized === "user") return "User";

  return String(role).charAt(0).toUpperCase() + String(role).slice(1);
};

const getAvatarColor = (username = "") => {
  const colors = ["#5B7FD1", "#FF7A7A", "#6BCB77", "#F4A261", "#9D4EDD", "#2A9D8F"];
  const firstChar = String(username || "A").trim().charAt(0).toUpperCase();
  const code = firstChar.charCodeAt(0) || 65;
  return colors[code % colors.length];
};

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
  const [adminUser, setAdminUser] = useState(readAdminUser());

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_user");

    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin_user");

    navigate("/admin/login", { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const refreshMaster = () => {
      try {
        setMaster(loadMaster());
      } catch (error) {
        console.error("Error refreshing master data:", error);
      }
    };

    const refreshAdminUser = () => {
      setAdminUser(readAdminUser());
    };

    const onAdminUserUpdated = (event) => {
      if (event?.detail) {
        setAdminUser({
          id: event.detail?.id ?? null,
          name: event.detail?.name || event.detail?.username || "Min admin",
          username: event.detail?.username || "admin",
          email: event.detail?.email || "",
          role: event.detail?.role || "admin",
          image_url: event.detail?.image_url || "",
        });
      } else {
        refreshAdminUser();
      }
    };

    refreshMaster();
    refreshAdminUser();

    window.addEventListener("focus", refreshMaster);
    window.addEventListener("storage", refreshMaster);
    window.addEventListener("storage", refreshAdminUser);
    window.addEventListener("admin-user-updated", onAdminUserUpdated);

    return () => {
      window.removeEventListener("focus", refreshMaster);
      window.removeEventListener("storage", refreshMaster);
      window.removeEventListener("storage", refreshAdminUser);
      window.removeEventListener("admin-user-updated", onAdminUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/master")) {
      setMasterOpen(true);
    }
  }, [location.pathname]);

  const masterTypes = useMemo(() => {
    return MASTER_TYPES.map((t) => ({
      ...t,
      total: Array.isArray(master[t.key]) ? master[t.key].length : 0,
    }));
  }, [master]);

  const displayName = useMemo(() => {
    return adminUser?.name || adminUser?.username || "Min admin";
  }, [adminUser]);

  const displayUsername = useMemo(() => {
    return adminUser?.username || "admin";
  }, [adminUser]);

  const displayRole = useMemo(() => {
    return formatRole(adminUser?.role);
  }, [adminUser]);

  const displayAvatar = useMemo(() => {
    return adminUser?.image_url || "";
  }, [adminUser]);

  const avatarLetter = useMemo(() => {
    return String(displayUsername || "A").trim().charAt(0).toUpperCase() || "A";
  }, [displayUsername]);

  const avatarColor = useMemo(() => {
    return getAvatarColor(displayUsername);
  }, [displayUsername]);

  return (
    <div className="adminShell">
      <button
        className={`hamburgerBtn ${sidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        className={`sidebarOverlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <button
          className="profile profileBtn"
          onClick={() => {
            navigate("/admin/profile");
            closeSidebar();
          }}
          type="button"
          title="Go to profile"
        >
          <div className="avatar">
            {displayAvatar ? (
              <img src={displayAvatar} alt="profile" className="avatarImg" />
            ) : (
              <div
                className="avatarCircle"
                style={{ backgroundColor: avatarColor }}
              >
                {avatarLetter}
              </div>
            )}
          </div>

          <div className="profileText">
            <div className="name">{displayName}</div>
            <div className="role">{displayRole}</div>
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
              type="button"
              className={`navItem masterToggle ${
                location.pathname.startsWith("/admin/master") ? "active" : ""
              }`}
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
                      className={({ isActive }) =>
                        isActive ? "masterItem active" : "masterItem"
                      }
                      onClick={closeSidebar}
                    >
                      <span className="masterLabel">{t.label}</span>
                      <span className="masterCount">{t.total}</span>
                    </NavLink>

                    <button
                      type="button"
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

        <button className="logoutBtn" onClick={handleLogout} type="button">
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
              <h3 className="modalTitle">
                Add New {MASTER_TYPES.find((t) => t.key === addType)?.label || "Item"}
              </h3>
              <button
                className="modalClose"
                onClick={() => setShowAddIntro(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              <p className="modalText">
                Preview recent items to reduce duplicates before adding.
              </p>

              <div className="mdPreviewList">
                {(Array.isArray(master[addType]) ? master[addType].slice(0, 3) : []).map(
                  (x) => (
                    <div className="mdPreviewRow" key={x.id}>
                      <span className="dot" />
                      <div className="previewText">{x.name}</div>
                      <div className="statusTiny">
                        {x.status === "Active" ? "Open" : "Closed"}
                      </div>
                    </div>
                  )
                )}

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
                type="button"
              >
                Continue
              </button>

              <button
                className="btn cancel"
                onClick={() => setShowAddIntro(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}