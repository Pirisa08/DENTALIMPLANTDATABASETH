import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { blogsAPI } from "../../services/api.js";
import "./ManageBlog.css";
const MySwal = withReactContent(Swal);

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function toAdminBlog(b) {
  if (!b) return null;

  return {
    id: b.id ?? null,
    title: b.title || "",
    description: b.description || "",
    publishedDate: b.publishedDate || "",
    readTime: b.readTime || "",
    category: b.category || "News",
    author: b.author || "Editorial Team",
    content: b.content || "",
    status: b.status || "Active",
    manualUrl: b.manualUrl || "",
    referenceUrl: b.referenceUrl || "",
    imageDataUrl: b.imageDataUrl || b.image || "",
  };
}

export default function ManageBlog() {
  const navigate = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogsAPI.getAll();
      const converted = Array.isArray(data) ? data.map(toAdminBlog).filter(Boolean) : [];

      converted.sort(
        (a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0)
      );

      setRows(converted);
    } catch (err) {
      console.error("Failed to load blogs:", err);
      alert(err.message || "Failed to load blogs");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();

    const params = new URLSearchParams(location.search || "");
    const qp = params.get("q") || "";
    if (qp) setQ(qp);
  }, [location.search]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((b) =>
      `${b.title} ${b.category} ${b.author}`.toLowerCase().includes(s)
    );
  }, [q, rows]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return iso;
    }
  };

 const delBlog = async (id) => {
  const blog = rows.find((x) => String(x.id) === String(id));
  const result = await MySwal.fire({
    title: `<span style='font-size:1.05em;font-weight:800;font-family:inherit;color:#22304c;'>Are you sure you want to delete?</span>`,
    html: `<div style='font-size:0.98em;font-family:inherit;color:#374151;'>Do you want to delete <b>"${blog?.title || "this blog"}"</b>?<br><span style='color:#b91c1c;font-weight:700;font-size:0.95em;'>Once deleted, it cannot be undone!</span></div>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#3085d6",
    focusCancel: true,
    customClass: {
      popup: 'swal2-blog-popup',
      title: 'swal2-blog-title',
      htmlContainer: 'swal2-blog-html',
      confirmButton: 'swal2-blog-confirm',
      cancelButton: 'swal2-blog-cancel',
    },
  });
  if (!result.isConfirmed) return;

  try {
    setActionId(id);
    await blogsAPI.delete(id);
    setRows((prev) => prev.filter((x) => String(x.id) !== String(id)));
    await MySwal.fire({
      icon: "success",
      title: `<span style='font-size:1em;font-family:inherit;color:#1f7a3a;'>Data deleted successfully</span>`,
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'swal2-blog-popup',
        title: 'swal2-blog-title',
      },
    });
  } catch (err) {
    console.error("Delete blog failed:", err);
    await MySwal.fire({
      icon: "error",
      title: `<span style='font-size:1em;font-family:inherit;color:#b91c1c;'>An error occurred while deleting</span>`,
      html: `<div style='font-size:0.97em;font-family:inherit;color:#374151;'>${err.message || "Please try again later"}</div>`,
      customClass: {
        popup: 'swal2-blog-popup',
        title: 'swal2-blog-title',
        htmlContainer: 'swal2-blog-html',
      },
    });
  } finally {
    setActionId(null);
  }
 };


  const toggleStatus = async (id) => {
    const target = rows.find((x) => String(x.id) === String(id));
    if (!target) return;

    const nextStatus = target.status === "Active" ? "Inactive" : "Active";

    try {
      setActionId(id);
      const updated = await blogsAPI.update(id, {
        ...target,
        status: nextStatus,
      });

      setRows((prev) =>
        prev.map((x) =>
          String(x.id) === String(id) ? toAdminBlog(updated) : x
        )
      );
    } catch (err) {
      console.error("Toggle status failed:", err);
      alert(err.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
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
        <div className="blogActionTop">
          <button className="addBtnBlog" onClick={() => navigate("/admin/blog/new")}>
            + Add New Blog
          </button>
        </div>
      </div>

      <div className="panelBlog">
        <h3 className="panelTitle">
          Recently Added Blogs {loading ? "(Loading...)" : ""}
        </h3>

        <div className="blogTable">
          <div className="bHead">
            <div>Image</div>
            <div>Title</div>
            <div>Links</div>
            <div className="centerCell">Date</div>
            <div className="centerCell">Status</div>
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

              <div className="titleCell cell" data-label="Title">
                {b.title}
              </div>

              <div className="ctaCell cell" data-label="Links">
                <a
                  className="linkBadge manual"
                  href={`/blog/${slugify(b.title)}-${b.id}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Post
                </a>

                {b.referenceUrl ? (
                  <a
                    className="linkBadge reference"
                    href={b.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Reference
                  </a>
                ) : null}
              </div>

              <div className="dateCell cell" data-label="Date">
                {fmtDate(b.publishedDate)}
              </div>

              <div className="statusCell cell" data-label="Status">
                <button
                  className={`pill status ${b.status === "Active" ? "on" : "off"}`}
                  onClick={() => toggleStatus(b.id)}
                  disabled={actionId === b.id}
                >
                  {b.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>

              <div className="actionsCol cell" data-label="Actions">
                <button
                  className="btn edit"
                  onClick={() => navigate(`/admin/blog/edit/${b.id}`)}
                  disabled={actionId === b.id}
                >
                  Edit
                </button>

                <button
                  className="btn del"
                  onClick={() => delBlog(b.id)}
                  disabled={actionId === b.id}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="empty">No blogs found.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="paginationWrap">
            <button
              className="paginationBtn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>

            <span className="paginationText">
              Page {page} of {totalPages}
            </span>

            <button
              className="paginationBtn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}