import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { blogsAPI } from "../../services/api.js";
import { mockBlogs } from "../data/implantsMockData.js";
import "./ManageBlog.css";

const BLOG_KEY = "admin_blogs_v1";
const DELETED_BLOGS_KEY = "deleted_blog_ids";

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const toISODate = (s) => {
  if (!s) return "";
  try {
    const d = new Date(s);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return s;
  } catch {
    return s;
  }
};

// Fallback seed from mock blogs if available
function loadBlogsWithFallback() {
  const raw = localStorage.getItem(BLOG_KEY);
  
  // Get deleted blog IDs
  const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
  let deletedIds = [];
  try {
    deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
  } catch {
    deletedIds = [];
  }
  
  if (!raw) {
    // First-time seed: use mock blogs with links, filter out deleted ones
    const mockSeed = mockBlogs
      .filter((b) => !deletedIds.includes(b.id))
      .map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description || b.excerpt || "",
        publishedDate: b.publishedDate,
        readTime: b.readTime || "5 min",
        category: b.category || "News",
        author: b.author || "Editorial Team",
        content: b.content || "",
        status: b.status || "Active",
        manualUrl: b.manualUrl || "",
        referenceUrl: b.referenceUrl || "",
        imageDataUrl: b.imageDataUrl || "",
      }));
    
    localStorage.setItem(BLOG_KEY, JSON.stringify(mockSeed));
    return mockSeed;
  }
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) {
      // Invalid format, reset to mockBlogs
      const mockSeed = mockBlogs
        .filter((b) => !deletedIds.includes(b.id))
        .map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description || b.excerpt || "",
          publishedDate: b.publishedDate,
          readTime: b.readTime || "5 min",
          category: b.category || "News",
          author: b.author || "Editorial Team",
          content: b.content || "",
          status: b.status || "Active",
          manualUrl: b.manualUrl || "",
          referenceUrl: b.referenceUrl || "",
          imageDataUrl: b.imageDataUrl || "",
        }));
      localStorage.setItem(BLOG_KEY, JSON.stringify(mockSeed));
      return mockSeed;
    }
    // Filter out deleted blogs from localStorage
    return arr.filter((b) => !deletedIds.includes(b.id));
  } catch {
    const mockSeed = mockBlogs
      .filter((b) => !deletedIds.includes(b.id))
      .map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description || b.excerpt || "",
        publishedDate: b.publishedDate,
        readTime: b.readTime || "5 min",
        category: b.category || "News",
        author: b.author || "Editorial Team",
        content: b.content || "",
        status: b.status || "Active",
        manualUrl: b.manualUrl || "",
        referenceUrl: b.referenceUrl || "",
        imageDataUrl: b.imageDataUrl || "",
      }));
    localStorage.setItem(BLOG_KEY, JSON.stringify(mockSeed));
    return mockSeed;
  }
}

export default function ManageBlog() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(loadBlogsWithFallback());
  const [apiBlogs, setApiBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [deletedBlogs, setDeletedBlogs] = useState([]);
  const [deleteNotification, setDeleteNotification] = useState(null);
  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  // Fetch blogs from API on mount
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const data = await blogsAPI.getAll();
        if (Array.isArray(data) && data.length > 0) {
          // Convert API format to admin format
          const converted = data.map((b) => ({
            id: b.id,
            title: b.title,
            description: b.description || b.excerpt || "",
            publishedDate: b.publishedDate || b.published,
            readTime: b.readTime || "5 min",
            category: b.category || "News",
            author: b.author || "Editorial Team",
            content: b.content || "",
            status: b.status || "Active",

            manualUrl: b.manualUrl || "",
            referenceUrl: b.referenceUrl || "",
            imageDataUrl: b.imageDataUrl || "",
          }));
          setApiBlogs(converted);
          
          // Reload from localStorage to get latest data
          const currentLocal = loadBlogsWithFallback();
          const apiIds = converted.map((b) => b.id);
          const localOnly = currentLocal.filter((b) => !apiIds.includes(b.id));
          setRows([...converted, ...localOnly]);
        }
      } catch (err) {
        // Ignore errors; use local storage fallback
        console.log("Could not fetch from API, using local storage");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const qp = params.get("q") || "";
    if (qp) setQ(qp);
  }, [location.search]);

  useEffect(() => {
    localStorage.setItem(BLOG_KEY, JSON.stringify(rows));
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((b) =>
      (b.title + " " + b.category + " " + b.author).toLowerCase().includes(s)
    );
  }, [q, rows]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const pagedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const delBlog = (id) => {
    const blog = rows.find(x => x.id === id);
    const title = blog ? blog.title : 'this blog';
    
    console.log('Deleting blog:', { id, title }); // Debug log
    
    // Add to deleted list
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_BLOGS_KEY, JSON.stringify(deletedIds));
    }
    
    // Remove from current view
    setRows((prev) => prev.filter((x) => x.id !== id));
    
    // Show success notification with recovery option
    const notificationData = {
      id: id,
      title: title,
      timestamp: Date.now()
    };
    console.log('Setting notification:', notificationData); // Debug log
    setDeleteNotification(notificationData);
    
    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      console.log('Auto-hiding notification'); // Debug log
      setDeleteNotification(null);
    }, 10000);
  };

  const undoDelete = () => {
    if (!deleteNotification) return;
    
    const { id } = deleteNotification;
    
    // Remove from deleted list
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    deletedIds = deletedIds.filter(delId => delId !== id);
    localStorage.setItem(DELETED_BLOGS_KEY, JSON.stringify(deletedIds));
    
    // Find blog to restore (from mockBlogs or API data)
    const blogToRestore = mockBlogs.find(b => b.id === id) || apiBlogs.find(b => b.id === id);
    
    if (blogToRestore) {
      const restoredBlog = {
        id: blogToRestore.id,
        title: blogToRestore.title,
        description: blogToRestore.description || blogToRestore.excerpt || "",
        publishedDate: blogToRestore.publishedDate,
        readTime: blogToRestore.readTime || "5 min",
        category: blogToRestore.category || "News",
        author: blogToRestore.author || "Editorial Team",
        content: blogToRestore.content || "",
        status: blogToRestore.status || "Active",
        manualUrl: blogToRestore.manualUrl || "",
        referenceUrl: blogToRestore.referenceUrl || "",
        imageDataUrl: blogToRestore.imageDataUrl || "",
      };
      setRows(prev => [...prev, restoredBlog]);
    }
    
    // Hide notification
    setDeleteNotification(null);
  };

  const toggleStatus = (id) => {
    setRows((prev) =>
      prev.map((x) =>
        String(x.id) === String(id)
          ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" }
          : x
      )
    );
  };

  const clearImage = (id) => {
    setRows((prev) => prev.map((x) => (String(x.id) === String(id) ? { ...x, imageDataUrl: "" } : x)));
  };

  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return iso;
    }
  };

  const reloadMockData = () => {
    if (!confirm('This will reload mock data while keeping deleted items removed. Continue?')) return;
    
    // Get deleted blog IDs
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    // Reload mockBlogs, but filter out deleted ones
    const refreshedData = mockBlogs
      .filter((b) => !deletedIds.includes(b.id))
      .map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description || b.excerpt || "",
        publishedDate: b.publishedDate,
        readTime: b.readTime || "5 min",
        category: b.category || "News",
        author: b.author || "Editorial Team",
        content: b.content || "",
        status: b.status || "Active",
        manualUrl: b.manualUrl || "",
        referenceUrl: b.referenceUrl || "",
        imageDataUrl: b.imageDataUrl || "",
      }));
    
    setRows(refreshedData);
  };

  const restoreMockBlogs = () => {
    if (!confirm('This will restore default mock blogs (Bone Level, Implant Surface, Platform Switching). Continue?')) return;
    
    // Get deleted blog IDs
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    // Mock blog IDs are 1, 2, 3 - remove them from deleted list
    const mockBlogIds = [1, 2, 3];
    const newDeletedIds = deletedIds.filter(id => !mockBlogIds.includes(id));
    
    // Save back
    localStorage.setItem(DELETED_BLOGS_KEY, JSON.stringify(newDeletedIds));
    
    // Reload data
    const refreshedData = loadBlogsWithFallback();
    setRows(refreshedData);
    
    alert(`Restored ${mockBlogIds.length} mock blogs!\nRefresh the page to see all changes.`);
  };

  const openDeletedItems = () => {
    // Get deleted blog IDs
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    // Find deleted blogs from mockBlogs
    const deleted = mockBlogs.filter(b => deletedIds.includes(b.id));
    setDeletedBlogs(deleted);
    setShowDeletedModal(true);
  };

  const restoreBlog = (id) => {
    // Remove from deleted list
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    deletedIds = deletedIds.filter(delId => delId !== id);
    localStorage.setItem(DELETED_BLOGS_KEY, JSON.stringify(deletedIds));
    
    // Add back to rows
    const blogToRestore = mockBlogs.find(b => b.id === id);
    if (blogToRestore) {
      const restoredBlog = {
        id: blogToRestore.id,
        title: blogToRestore.title,
        description: blogToRestore.description || blogToRestore.excerpt || "",
        publishedDate: blogToRestore.publishedDate,
        readTime: blogToRestore.readTime || "5 min",
        category: blogToRestore.category || "News",
        author: blogToRestore.author || "Editorial Team",
        content: blogToRestore.content || "",
        status: blogToRestore.status || "Active",
        manualUrl: blogToRestore.manualUrl || "",
        referenceUrl: blogToRestore.referenceUrl || "",
        imageDataUrl: blogToRestore.imageDataUrl || "",
      };
      setRows(prev => [...prev, restoredBlog]);
    }
    
    // Update modal list
    setDeletedBlogs(prev => prev.filter(b => b.id !== id));
  };

  const resetAllData = () => {
    if (!confirm('This will RESET EVERYTHING including deleted items. All blogs will be restored. Continue?')) return;
    localStorage.removeItem(BLOG_KEY);
    localStorage.removeItem(DELETED_BLOGS_KEY);
    window.location.reload();
  };

  return (
    <div className="blogWrap">
      <AdminSearchBar
        placeholder="Search blogs…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Blog Management" },
        ]}
      />

      <div className="headRow">
        <h2 className="pageTitle">Blog Management</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="addBtnBlog" onClick={() => navigate("/admin/blog/new")}>+ Add New Blog</button>
          <button className="addBtnBlog refresh" onClick={reloadMockData}>⟳ Refresh Data</button>
          <button 
            className="trashBtn" 
            onClick={openDeletedItems}
            title="View deleted items"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="panelBlog">
        <h3 className="panelTitle">Recently Added Blogs</h3>

        <div className="blogTable">
          <div className="bHead">
            <div>Image</div>
            <div>Title</div>
            <div>Links</div>
            <div style={{ textAlign: 'center' }}>Date</div>
            <div style={{ textAlign: 'center' }}>Status</div>
            <div className="actionsCol">Actions</div>
          </div>

          {pagedRows.map((b) => (
            <div className="bRow" key={b.id}>
              <div className="imgCell cell" data-label="Image">
                {b.imageDataUrl ? (
                  <img src={b.imageDataUrl} alt="blog" />
                ) : (
                  <div className="imgPh">No Image</div>
                )}
              </div>
              <div className="titleCell cell" data-label="Title">{b.title}</div>
              <div className="ctaCell cell" data-label="Links">
                {b.manualUrl && (
                  <a 
                    className="linkBadge manual" 
                    href={`/blog/${slugify(b.title)}-${b.id}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    title="View article on user blog page"
                  >
                    📄 View Post
                  </a>
                )}
                {b.referenceUrl && (
                  <a 
                    className="linkBadge reference" 
                    href={b.referenceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    title="External reference source"
                  >
                    🔗 Reference
                  </a>
                )}
                {!b.manualUrl && !b.referenceUrl && <span className="muted">—</span>}
              </div>
              <div className="dateCell cell" data-label="Date">{fmtDate(b.publishedDate)}</div>
              <div className="statusCell cell" data-label="Status">
                <button
                  className={`pill status ${b.status === "Active" ? "on" : "off"}`}
                  onClick={() => toggleStatus(b.id)}
                  title={b.status === "Active" ? "Click to close (hide from users)" : "Click to open (show to users)"}
                >
                  {b.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>

              <div className="actionsCol cell" data-label="Actions">
                <button className="btn edit" onClick={() => navigate(`/admin/blog/edit/${b.id}`)}>
                  Edit
                </button>
                <button className="btn del" onClick={() => delBlog(b.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div className="empty">No blogs found.</div>}
        </div>
        {/* Pagination */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 20 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: page === 1 ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: page === 1 ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: page === 1 ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: page === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (page !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
              onMouseOut={e => { if (page !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
            >
              ← Previous
            </button>
            <span style={{ fontWeight: 500, fontSize: "16px", color: "#374151", letterSpacing: 0.5 }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: page === totalPages ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: page === totalPages ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: page === totalPages ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (page !== totalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
              onMouseOut={e => { if (page !== totalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
            >
              Next →
            </button>
          </div>
        )}
        </div>
      
      
      {/* Delete Notification */}
      {deleteNotification && (
        <div className="deleteNotification" style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 9999,
          maxWidth: '400px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '2px solid #22c55e',
          animation: 'slideInUp 0.3s ease-out',
          display: 'block'
        }}>
          <div className="notificationContent" style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '20px'
          }}>
            <div className="notificationIcon" style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>✅</div>
            <div className="notificationText" style={{ flex: 1, minWidth: 0 }}>
              <div className="notificationTitle" style={{
                fontWeight: 700,
                fontSize: '15px',
                color: '#1f2937',
                marginBottom: '4px'
              }}>Blog deleted successfully</div>
              <div className="notificationSubtitle" style={{
                fontSize: '13px',
                color: '#6b7280',
                lineHeight: 1.4
              }}>
                {`"${deleteNotification.title}" has been moved to trash`}
              </div>
            </div>
            <div className="notificationActions" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0
            }}>
              <button className="undoBtn" onClick={undoDelete} style={{
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.2s ease',  
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
              }}>
                ↺ Undo
              </button>
              <button className="closeNotificationBtn" onClick={() => setDeleteNotification(null)} style={{
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                color: '#9ca3af',
                borderRadius: '6px',
                padding: '6px',
                fontSize: '18px',
                lineHeight: 1,
                transition: 'all 0.2s ease',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deleted Items Modal */}
      {showDeletedModal && (
        <div className="modalOverlay" onClick={() => setShowDeletedModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>🗑️ Deleted Items</h3>
              <button className="closeBtn" onClick={() => setShowDeletedModal(false)}>×</button>
            </div>
            <div className="modalBody">
              {deletedBlogs.length === 0 ? (
                <p className="emptyMessage">No deleted items.</p>
              ) : (
                <div className="deletedList">
                  {deletedBlogs.map(blog => (
                    <div key={blog.id} className="deletedItem">
                      <div className="deletedItemInfo">
                        <div className="deletedItemTitle">{blog.title}</div>
                        <div className="deletedItemMeta">{blog.category} • {blog.author}</div>
                      </div>
                      <button className="restoreBtn" onClick={() => restoreBlog(blog.id)}>
                        ↺ Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
