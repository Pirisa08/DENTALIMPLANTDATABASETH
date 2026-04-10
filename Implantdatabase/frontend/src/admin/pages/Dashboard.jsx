import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import { implantsAPI, masterDataAPI, blogsAPI } from "../../services/api.js";
import { MASTER_KEY } from "./masterDataStore.js";

const BLOG_KEY = "admin_blogs_v1";
const IMPLANTS_KEY = "admin_implants_v1";

const MASTER_TYPES = [
  { key: "companies", label: "Companies" },
  { key: "levels", label: "Levels" },
  { key: "countries", label: "Countries" },
];

const getNameById = (master, type, id) => {
  if (!id) return "";
  const list = master?.[type] || [];
  const found = list.find((x) => Number(x.id) === Number(id));
  return found?.name || "";
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const [implants, setImplants] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [masterData, setMasterData] = useState({ companies: [], levels: [], countries: [] });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusView, setStatusView] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Pagination states
  const [implantPage, setImplantPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [implantsRes, blogsRes, companies, levels, countries] = await Promise.all([
          implantsAPI.getAll().catch(() => []),
          blogsAPI.getAll().catch(() => []),
          masterDataAPI.getCompanies(),
          masterDataAPI.getLevels(),
          masterDataAPI.getCountries(),
        ]);

        // Load implants from localStorage first, then fallback to API
        const localImplantsRaw = localStorage.getItem(IMPLANTS_KEY);
        let localImplants = [];
        try {
          localImplants = localImplantsRaw ? JSON.parse(localImplantsRaw) : [];
          if (!Array.isArray(localImplants)) localImplants = [];
        } catch {
          localImplants = [];
        }
        
        const finalImplants = localImplants.length > 0 ? localImplants : (Array.isArray(implantsRes) ? implantsRes : []);
        setImplants(finalImplants);
        
        // Load blogs from localStorage first, then fallback to API
        const localBlogsRaw = localStorage.getItem(BLOG_KEY);
        let localBlogs = [];
        try {
          localBlogs = localBlogsRaw ? JSON.parse(localBlogsRaw) : [];
          if (!Array.isArray(localBlogs)) localBlogs = [];
        } catch {
          localBlogs = [];
        }
        
        // Use local blogs if available, otherwise use API response
        const finalBlogs = localBlogs.length > 0 ? localBlogs : (Array.isArray(blogsRes) ? blogsRes : []);
        setBlogs(finalBlogs);
        
        // Master data: prefer localStorage seed, fallback to API
        let localMaster = {};
        try {
          const raw = localStorage.getItem(MASTER_KEY);
          localMaster = raw ? JSON.parse(raw) : {};
        } catch {
          localMaster = {};
        }

        const mergedMaster = {
          companies: Array.isArray(localMaster.company) && localMaster.company.length ? localMaster.company : companies,
          levels: Array.isArray(localMaster.level) && localMaster.level.length ? localMaster.level : levels,
          countries: Array.isArray(localMaster.country) && localMaster.country.length ? localMaster.country : countries,
        };

        setMasterData(mergedMaster);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Listen for localStorage changes to update counts in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      // Reload implants from localStorage
      const localImplantsRaw = localStorage.getItem(IMPLANTS_KEY);
      try {
        const localImplants = localImplantsRaw ? JSON.parse(localImplantsRaw) : [];
        if (Array.isArray(localImplants)) {
          setImplants(localImplants);
        }
      } catch {}

      // Reload blogs from localStorage
      const localBlogsRaw = localStorage.getItem(BLOG_KEY);
      try {
        const localBlogs = localBlogsRaw ? JSON.parse(localBlogsRaw) : [];
        if (Array.isArray(localBlogs)) {
          setBlogs(localBlogs);
        }
      } catch {}

      // Reload master data from localStorage
      try {
        const raw = localStorage.getItem(MASTER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed) {
            setMasterData({
              companies: parsed.company || [],
              levels: parsed.level || [],
              countries: parsed.country || [],
            });
          }
        }
      } catch {}
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for focus events (when returning to tab)
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const implantsCount = implants.length;
  const blogsCount = blogs.length;

  const masterCounts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    MASTER_TYPES.forEach((t) => {
      const arr = Array.isArray(masterData[t.key]) ? masterData[t.key] : [];
      arr.forEach((item) => {
        if ((item.status || "").toLowerCase() === "inactive") inactive += 1;
        else active += 1;
      });
    });
    return { active, inactive, total: active + inactive };
  }, [masterData]);

  const masterStatusList = useMemo(() => {
    const result = MASTER_TYPES.map((t) => {
      const arr = Array.isArray(masterData[t.key]) ? masterData[t.key] : [];
      const items = arr.filter((x) => (x.status || "Active").toLowerCase() === statusView);
      return {
        key: t.key,
        label: t.label,
        count: items.length,
        sample: items.slice(0, 4),
      };
    }).filter((x) => x.count > 0);
    return result;
  }, [masterData, statusView]);

  const filteredImplants = useMemo(() => {
    const s = q.trim().toLowerCase();
    const sorted = [...implants].sort((a, b) => {
      const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (db !== da) return db - da;
      return (b.id || 0) - (a.id || 0);
    });
    if (!s) return sorted;
    return sorted.filter((x) => {
      const companyName = x.companyId ? getNameById(masterData, "companies", x.companyId) : (x.company || x.brand || "");
      return (String(x.name || "") + " " + companyName).toLowerCase().includes(s);
    });
  }, [q, implants, masterData]);

  // Pagination for implants
  const implantTotalPages = Math.ceil(filteredImplants.length / ITEMS_PER_PAGE) || 1;
  const visibleImplants = useMemo(() => {
    const start = (implantPage - 1) * ITEMS_PER_PAGE;
    return filteredImplants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImplants, implantPage]);

  const filteredBlogs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return blogs;
    return blogs.filter((x) => String(x.title || "").toLowerCase().includes(s));
  }, [q, blogs]);

  // Pagination for blogs
  const blogTotalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;
  const visibleBlogs = useMemo(() => {
    const start = (blogPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, blogPage]);

  // ✅ ลบ implant จาก store
  const deleteImplant = (id) => {
    const implant = implants.find(x => x.id === id);
    const name = implant ? implant.name : 'this implant';
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setImplants((prev) => prev.filter((x) => x.id !== id));
  };

  const editImplant = (id) => {
    // ถ้าคุณยังไม่มีหน้า edit implant ให้เปลี่ยนเป็นไปหน้า /admin/implants
    navigate(`/admin/implants/edit/${id}`);
  };

  // ✅ ลบ blog จาก store
  const deleteBlog = (id) => {
    const blog = blogs.find(x => x.id === id);
    const title = blog ? blog.title : 'this blog';
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    setBlogs((prev) => prev.filter((x) => x.id !== id));
  };

  const editBlog = (id) => {
    navigate(`/admin/blog/edit/${id}`);
  };

  return (
    <div className="dashWrap">
      <AdminSearchBar placeholder="Search…" value={q} onChangeQ={setQ} onSearch={setQ} />
      <h2 className="dashTitle">Dashboard</h2>

      {error && <div style={{ color: "#c0392b", marginBottom: 12 }}>Error: {error}</div>}
      {loading && <div style={{ color: "#555", marginBottom: 12 }}>Loading data…</div>}

      <div className="cards">
        <div
          className="statCard yellow"
          onClick={() => navigate("/admin/implants")}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">🦷</div>
          <div>
            <div className="statNum">{implantsCount}</div>
            <div className="statLabel">Implants</div>
          </div>
        </div>

        <div
          className="statCard purple"
          onClick={() => navigate("/admin/blog")}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">📝</div>
          <div>
            <div className="statNum">{blogsCount}</div>
            <div className="statLabel">Blogs</div>
          </div>
        </div>

        <div
          className="statCard green"
          onClick={() => navigate("/admin/master")}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">🗂️</div>
          <div>
            <div className="statNum">{masterCounts.total}</div>
            <div className="statLabel">Master Data</div>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <div className="panelHead">
            <h3 onClick={() => navigate("/admin/implants")} style={{ cursor: "pointer" }}>
              Implants
            </h3>
            <button className="addBtn" onClick={() => navigate("/admin/implants/new")}>
              + Add new implant
            </button>
          </div>

          <div className="list">
            {visibleImplants.map((it) => (
              <div
                className="listRow"
                key={it.id}
                onClick={() => navigate("/admin/implants")}
                style={{ cursor: "pointer" }}
              >
                <div className="thumb">
                  {it.imageDataUrl || it.image1 ? (
                    <img
                      src={it.imageDataUrl || it.image1}
                      alt={it.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ) : null}
                </div>

                <div className="rowText">
                  <div className="rowTitle">{it.name}</div>
                  <div className="rowSub">{it.companyId ? getNameById('company', it.companyId) : (it.company || it.brand)}</div>
                </div>

                <div className="rowActions">
                  <button
                    className="btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      editImplant(it.id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn del"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImplant(it.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredImplants.length === 0 && <div className="empty">No implants found.</div>}
          </div>
          {/* Pagination for Implants */}
          {filteredImplants.length > ITEMS_PER_PAGE && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 20 }}>
              <button
                onClick={() => setImplantPage((p) => Math.max(1, p - 1))}
                disabled={implantPage === 1}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "none",
                  background: implantPage === 1 ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                  color: implantPage === 1 ? "#9ca3af" : "#fff",
                  fontWeight: 600,
                  fontSize: "16px",
                  boxShadow: implantPage === 1 ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                  cursor: implantPage === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={e => { if (implantPage !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
                onMouseOut={e => { if (implantPage !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: 500, fontSize: "16px", color: "#374151", letterSpacing: 0.5 }}>
                Page {implantPage} of {implantTotalPages}
              </span>
              <button
                onClick={() => setImplantPage((p) => Math.min(implantTotalPages, p + 1))}
                disabled={implantPage === implantTotalPages}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "none",
                  background: implantPage === implantTotalPages ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                  color: implantPage === implantTotalPages ? "#9ca3af" : "#fff",
                  fontWeight: 600,
                  fontSize: "16px",
                  boxShadow: implantPage === implantTotalPages ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                  cursor: implantPage === implantTotalPages ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={e => { if (implantPage !== implantTotalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
                onMouseOut={e => { if (implantPage !== implantTotalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
              >
                Next →
              </button>
            </div>
          )}
        </section>

        <section className="panel" onClick={() => navigate("/admin/master")} style={{ cursor: "pointer" }}>
          <div className="panelHead">
            <h3>Master Data</h3>
          </div>

          <div className="masterBox">
            <div
              className="masterRow ok"
              onClick={(e) => {
                e.stopPropagation();
                setStatusView("active");
                setShowStatusModal(true);
              }}
            >
              <div className="badge">✔</div>
              <div className="masterText">Master Data Active</div>
              <div className="masterNum">: {masterCounts.active}</div>
            </div>

            <div
              className="masterRow no"
              onClick={(e) => {
                e.stopPropagation();
                setStatusView("inactive");
                setShowStatusModal(true);
              }}
            >
              <div className="badge">−</div>
              <div className="masterText">Master Data Inactive</div>
              <div className="masterNum">: {masterCounts.inactive}</div>
            </div>
          </div>
        </section>
      </div>

      <section className="panel full">
        <div className="panelHead">
          <h3 onClick={() => navigate("/admin/blog")} style={{ cursor: "pointer" }}>
            Blog
          </h3>
          <button className="addBtn" onClick={() => navigate("/admin/blog/new")}>
            + Add new blog
          </button>
        </div>

        <div className="list">
          {visibleBlogs.map((b) => (
            <div className="blogRow" key={b.id} onClick={() => navigate("/admin/blog")} style={{ cursor: "pointer" }}>
              <div className="blogTitle">{b.title}</div>
              <div className="blogMeta">
                {(b.category || b.type || "Blog")} /{" "}
                {b.publishedDate
                  ? new Date(b.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
                  : (b.date || "")}
              </div>

              <div className="rowActions">
                <button
                  className="btn edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    editBlog(b.id);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn del"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlog(b.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredBlogs.length === 0 && <div className="empty">No blogs found.</div>}
        </div>
        {/* Pagination for Blogs */}
        {filteredBlogs.length > ITEMS_PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 20 }}>
            <button
              onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
              disabled={blogPage === 1}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: blogPage === 1 ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: blogPage === 1 ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: blogPage === 1 ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: blogPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (blogPage !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
              onMouseOut={e => { if (blogPage !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
            >
              ← Previous
            </button>
            <span style={{ fontWeight: 500, fontSize: "16px", color: "#374151", letterSpacing: 0.5 }}>
              Page {blogPage} of {blogTotalPages}
            </span>
            <button
              onClick={() => setBlogPage((p) => Math.min(blogTotalPages, p + 1))}
              disabled={blogPage === blogTotalPages}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: blogPage === blogTotalPages ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: blogPage === blogTotalPages ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: blogPage === blogTotalPages ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: blogPage === blogTotalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (blogPage !== blogTotalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
              onMouseOut={e => { if (blogPage !== blogTotalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
            >
              Next →
            </button>
          </div>
        )}
      </section>

      {showStatusModal && (
        <div className="dashModalOverlay" onClick={() => setShowStatusModal(false)}>
          <div className="dashModal" onClick={(e) => e.stopPropagation()}>
            <div className="dashModalHead">
              <h3 className="dashModalTitle">
                {statusView === "active" ? "Active" : "Inactive"} Master Data
              </h3>
              <button className="dashModalClose" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="dashModalBody">
              {masterStatusList.length === 0 && (
                <div className="empty">No items found.</div>
              )}
              {masterStatusList.map((t) => (
                <div className="dashStatusRow" key={t.key}>
                  <div className="dashStatusHeader">
                    <div className="dashStatusLabel">{t.label}</div>
                    <div className="dashStatusCount">{t.count}</div>
                  </div>
                  <div className="dashStatusList">
                    {t.sample.map((item) => (
                      <div className="dashStatusItem" key={item.id}>
                        <span className="dot" />
                        <span className="dashStatusText">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="dashStatusLink"
                    onClick={() => {
                      setShowStatusModal(false);
                      navigate(`/admin/master/${t.key}`);
                    }}
                  >
                    View {t.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
