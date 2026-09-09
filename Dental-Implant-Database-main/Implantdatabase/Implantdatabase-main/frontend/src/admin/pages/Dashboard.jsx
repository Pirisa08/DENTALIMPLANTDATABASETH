import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import {
  implantsAPI,
  masterDataAPI,
  blogsAPI,
  resolveImageUrl,
} from "../../services/api.js";

const MASTER_TYPES = [
  { key: "companies", label: "Companies" },
  { key: "levels", label: "Levels" },
  { key: "countries", label: "Countries" },
];

const ImplantIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="statSvg">
    <path d="M8.7 3.5c1.1 0 2 .5 2.7 1.2.4.4.8.4 1.2 0 .7-.7 1.6-1.2 2.7-1.2 2.3 0 4 1.8 4 4.2 0 1.4-.5 2.7-1.2 3.8-.6.9-.9 1.9-1 3l-.3 3.2c-.2 1.8-1.4 3.1-2.9 3.1-1 0-1.6-.7-1.8-1.7l-.4-2.2c-.1-.6-.4-.9-.7-.9s-.6.3-.7.9l-.4 2.2c-.2 1-1 1.7-1.9 1.7-1.5 0-2.7-1.3-2.9-3.1l-.3-3.2c-.1-1.1-.4-2.1-1-3-.7-1.1-1.2-2.4-1.2-3.8 0-2.4 1.8-4.2 4.1-4.2Z" />
    <path d="M8 6.2c1.2 0 1.9.7 2.5 1.2.9.8 2.1.8 3 0 .6-.5 1.3-1.2 2.5-1.2" />
  </svg>
);

const BlogIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="statSvg">
    <path d="M6 3.5h8.2L19 8.3v12.2H6V3.5Z" />
    <path d="M14 3.7v5h5" />
    <path d="M8.8 12h6.4M8.8 15h6.4M8.8 18h4.6" />
  </svg>
);

const MasterDataIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="statSvg">
    <path d="M3.8 6.5h5l1.8 2h9.6v10.8H3.8V6.5Z" />
    <path d="M6.5 12.2h11M6.5 15.2h11" />
  </svg>
);

const ImagePlaceholderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="thumbSvg">
    <path d="M5 5.5h14v13H5v-13Z" />
    <path d="m7.5 16 3.4-4 2.5 2.8 1.4-1.6 1.8 2.8" />
    <path d="M15.7 9.3h.1" />
  </svg>
);

const PaginationArrow = ({ direction }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="paginationIcon">
    <path d={direction === "prev" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
  </svg>
);

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
  const [masterData, setMasterData] = useState({
    companies: [],
    levels: [],
    countries: [],
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusView, setStatusView] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [implantPage, setImplantPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [implantsRes, blogsRes, companies, levels, countries] =
          await Promise.all([
            implantsAPI.getAll().catch(() => []),
            blogsAPI.getAll().catch(() => []),
            masterDataAPI.getCompanies(),
            masterDataAPI.getLevels(),
            masterDataAPI.getCountries(),
          ]);

        setImplants(Array.isArray(implantsRes) ? implantsRes : []);
        setBlogs(Array.isArray(blogsRes) ? blogsRes : []);
        setMasterData({
          companies: companies || [],
          levels: levels || [],
          countries: countries || [],
        });
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();

    const refresh = () => load();
    window.addEventListener("implants:updated", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("implants:updated", refresh);
      window.removeEventListener("focus", refresh);
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
    return MASTER_TYPES.map((t) => {
      const arr = Array.isArray(masterData[t.key]) ? masterData[t.key] : [];
      const items = arr.filter(
        (x) => (x.status || "Active").toLowerCase() === statusView
      );

      return {
        key: t.key,
        label: t.label,
        count: items.length,
        sample: items.slice(0, 4),
      };
    }).filter((x) => x.count > 0);
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
      const companyName =
        x?.company?.name ||
        (x.companyId ? getNameById(masterData, "companies", x.companyId) : "") ||
        x.company ||
        x.brand ||
        "";

      return `${String(x.name || "")} ${companyName}`
        .toLowerCase()
        .includes(s);
    });
  }, [q, implants, masterData]);

  const implantTotalPages =
    Math.ceil(filteredImplants.length / ITEMS_PER_PAGE) || 1;

  const visibleImplants = useMemo(() => {
    const start = (implantPage - 1) * ITEMS_PER_PAGE;
    return filteredImplants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImplants, implantPage]);

  const filteredBlogs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return blogs;
    return blogs.filter((x) =>
      String(x.title || "").toLowerCase().includes(s)
    );
  }, [q, blogs]);

  const blogTotalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;

  const visibleBlogs = useMemo(() => {
    const start = (blogPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, blogPage]);

  const deleteImplant = async (id) => {
    const implant = implants.find((x) => x.id === id);
    const name = implant ? implant.name : "this implant";

    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    try {
      if (implantsAPI.delete) {
        await implantsAPI.delete(id);
      }

      setImplants((prev) => prev.filter((x) => x.id !== id));
      window.dispatchEvent(new Event("implants:updated"));
    } catch (err) {
      alert("Failed to delete implant: " + (err.message || err));
    }
  };

  const editImplant = (id) => {
    navigate(`/admin/implants/edit/${id}`);
  };

  const deleteBlog = (id) => {
    const blog = blogs.find((x) => x.id === id);
    const title = blog ? blog.title : "this blog";

    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    setBlogs((prev) => prev.filter((x) => x.id !== id));
  };

  const editBlog = (id) => {
    navigate(`/admin/blog/edit/${id}`);
  };

  return (
    <div className="dashWrap">
      <AdminSearchBar
        placeholder="Search…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <h2 className="dashTitle">Dashboard</h2>

      {error && (
        <div style={{ color: "#c0392b", marginBottom: 12 }}>Error: {error}</div>
      )}
      {loading && (
        <div style={{ color: "#555", marginBottom: 12 }}>Loading data…</div>
      )}

      <div className="cards">
        <div
          className="statCard yellow"
          onClick={() => navigate("/admin/implants")}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">
            <ImplantIcon />
          </div>
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
          <div className="statIcon">
            <BlogIcon />
          </div>
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
          <div className="statIcon">
            <MasterDataIcon />
          </div>
          <div>
            <div className="statNum">{masterCounts.total}</div>
            <div className="statLabel">Master Data</div>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <div className="panelHead">
            <h3
              onClick={() => navigate("/admin/implants")}
              style={{ cursor: "pointer" }}
            >
              Implants
            </h3>
            <button
              className="addBtn"
              onClick={() => navigate("/admin/implants/new")}
            >
              + Add new implant
            </button>
          </div>

          <div className="list">
            {visibleImplants.map((it) => {
              const imageSrc = resolveImageUrl(it.imageDataUrl || it.image1);

              return (
                <div
                  className="listRow"
                  key={it.id}
                  onClick={() => navigate("/admin/implants")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="thumb">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={it.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <span className="thumbPlaceholder" title="No image">
                        <ImagePlaceholderIcon />
                      </span>
                    )}
                  </div>

                  <div className="rowText">
                    <div className="rowTitle">{it.name}</div>
                    <div className="rowSub">
                      {it?.company?.name ||
                        (it.companyId
                          ? getNameById(masterData, "companies", it.companyId)
                          : "") ||
                        it.company ||
                        it.brand}
                    </div>
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
              );
            })}

            {filteredImplants.length === 0 && (
              <div className="empty">No implants found.</div>
            )}
          </div>

          {filteredImplants.length > ITEMS_PER_PAGE && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setImplantPage((p) => Math.max(1, p - 1))}
                disabled={implantPage === 1}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    implantPage === 1
                      ? "#e5e7eb"
                      : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                  color: implantPage === 1 ? "#9ca3af" : "#fff",
                  fontWeight: 600,
                  fontSize: "16px",
                  boxShadow:
                    implantPage === 1
                      ? "none"
                      : "0 2px 8px rgba(59,130,246,0.10)",
                  cursor: implantPage === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                <PaginationArrow direction="prev" />
                <span>Previous</span>
              </button>

              <span
                style={{
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#374151",
                  letterSpacing: 0.5,
                }}
              >
                Page {implantPage} of {implantTotalPages}
              </span>

              <button
                onClick={() =>
                  setImplantPage((p) => Math.min(implantTotalPages, p + 1))
                }
                disabled={implantPage === implantTotalPages}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    implantPage === implantTotalPages
                      ? "#e5e7eb"
                      : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                  color:
                    implantPage === implantTotalPages ? "#9ca3af" : "#fff",
                  fontWeight: 600,
                  fontSize: "16px",
                  boxShadow:
                    implantPage === implantTotalPages
                      ? "none"
                      : "0 2px 8px rgba(59,130,246,0.10)",
                  cursor:
                    implantPage === implantTotalPages
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span>Next</span>
                <PaginationArrow direction="next" />
              </button>
            </div>
          )}
        </section>

        <section
          className="panel"
          onClick={() => navigate("/admin/master")}
          style={{ cursor: "pointer" }}
        >
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
          <h3
            onClick={() => navigate("/admin/blog")}
            style={{ cursor: "pointer" }}
          >
            Blog
          </h3>
          <button
            className="addBtn"
            onClick={() => navigate("/admin/blog/new")}
          >
            + Add new blog
          </button>
        </div>

        <div className="list">
          {visibleBlogs.map((b) => (
            <div
              className="blogRow"
              key={b.id}
              onClick={() => navigate("/admin/blog")}
              style={{ cursor: "pointer" }}
            >
              <div className="blogTitle">{b.title}</div>
              <div className="blogMeta">
                {(b.category || b.type || "Blog")} /{" "}
                {b.publishedDate
                  ? new Date(b.publishedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })
                  : b.date || ""}
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

          {filteredBlogs.length === 0 && (
            <div className="empty">No blogs found.</div>
          )}
        </div>

        {filteredBlogs.length > ITEMS_PER_PAGE && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              marginTop: 20,
            }}
          >
            <button
              onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
              disabled={blogPage === 1}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background:
                  blogPage === 1
                    ? "#e5e7eb"
                    : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: blogPage === 1 ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow:
                  blogPage === 1
                    ? "none"
                    : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: blogPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <PaginationArrow direction="prev" />
              <span>Previous</span>
            </button>

            <span
              style={{
                fontWeight: 500,
                fontSize: "16px",
                color: "#374151",
                letterSpacing: 0.5,
              }}
            >
              Page {blogPage} of {blogTotalPages}
            </span>

            <button
              onClick={() =>
                setBlogPage((p) => Math.min(blogTotalPages, p + 1))
              }
              disabled={blogPage === blogTotalPages}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background:
                  blogPage === blogTotalPages
                    ? "#e5e7eb"
                    : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: blogPage === blogTotalPages ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow:
                  blogPage === blogTotalPages
                    ? "none"
                    : "0 2px 8px rgba(59,130,246,0.10)",
                cursor:
                  blogPage === blogTotalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <span>Next</span>
              <PaginationArrow direction="next" />
            </button>
          </div>
        )}
      </section>

      {showStatusModal && (
        <div
          className="dashModalOverlay"
          onClick={() => setShowStatusModal(false)}
        >
          <div className="dashModal" onClick={(e) => e.stopPropagation()}>
            <div className="dashModalHead">
              <h3 className="dashModalTitle">
                {statusView === "active" ? "Active" : "Inactive"} Master Data
              </h3>
              <button
                className="dashModalClose"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
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
