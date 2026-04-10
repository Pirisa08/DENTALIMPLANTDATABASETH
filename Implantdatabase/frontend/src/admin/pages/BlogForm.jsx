import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { blogsAPI } from "../../services/api.js";
import { mockBlogs } from "../data/implantsMockData.js";
import "./BlogForm.css";

const BLOG_KEY = "admin_blogs_v1";
const DELETED_BLOGS_KEY = "deleted_blog_ids";

const OPTIONS = {
  readTime: ["3 Min", "5 Min", "10 Min", "8 min read", "9 min read", "12 min read"],
  category: ["Education", "Technology", "Clinical Research", "Clinical Techniques", "Research", "News"],
};

function readArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

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
    // First-time seed: use mock blogs and save to localStorage
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

export default function BlogForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const list = loadBlogsWithFallback();
  const editingItem = mode === "edit" ? list.find((x) => String(x.id) === String(id)) : null;

  const toLocalDatetime = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const [form, setForm] = useState(() => ({
    title: editingItem?.title || "",
    description: editingItem?.description || "",
    publishedDate: editingItem?.publishedDate || toLocalDatetime(),
    readTime: editingItem?.readTime || "",
    category: editingItem?.category || "",
    author: editingItem?.author || "",
    content: editingItem?.content || "",
    manualUrl: editingItem?.manualUrl || editingItem?.ctaUrl || "",
    referenceUrl: editingItem?.referenceUrl || "",
    imageDataUrl: editingItem?.imageDataUrl || "",
    status: editingItem?.status || "Active",
  }));

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSave = useMemo(() => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      form.publishedDate &&
      form.readTime &&
      form.category &&
      form.author.trim() &&
      form.content.trim()
    );
  }, [form]);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("imageDataUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!canSave) {
      alert("Please fill all fields before saving.");
      return;
    }

    // Read ALL blogs from localStorage (don't filter deleted items during save)
    const allBlogsRaw = localStorage.getItem(BLOG_KEY);
    let blogs = [];
    try {
      blogs = allBlogsRaw ? JSON.parse(allBlogsRaw) : [];
      if (!Array.isArray(blogs)) blogs = [];
    } catch {
      blogs = [];
    }
    
    // If localStorage is empty, seed from mockBlogs
    if (blogs.length === 0) {
      blogs = mockBlogs.map((b) => ({
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
    }

    if (mode === "edit") {
      if (!editingItem) {
        alert("Blog not found.");
        navigate("/admin/blog");
        return;
      }

      // Update in localStorage
      const updated = blogs.map((b) =>
        String(b.id) === String(id)
          ? { ...b, ...form, id: b.id }
          : b
      );
      localStorage.setItem(BLOG_KEY, JSON.stringify(updated));

      // Update in API
      try {
        await blogsAPI.update(id, form);
      } catch (err) {
        console.error("Failed to update blog in API:", err);
        // Continue anyway; local storage has been updated
      }

      navigate("/admin/blog");
      return;
    }

    // Create new blog
    const newItem = { id: Date.now(), ...form };
    localStorage.setItem(BLOG_KEY, JSON.stringify([newItem, ...blogs]));

    // Also POST to API
    try {
      await blogsAPI.create(form);
    } catch (err) {
      console.error("Failed to create blog in API:", err);
      // Continue anyway; local storage has been updated
    }

    navigate("/admin/blog");
  };

  return (
    <div className="bfWrap">
      <AdminSearchBar
        placeholder="Search blogs…"
        onPickSuggestion={(m) => {
          if (m.title) setField("title", m.title);
          if (m.category) setField("category", m.category);
          if (m.author) setField("author", m.author);
        }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: mode === "edit" ? "Edit Blog" : "New Blog" },
        ]}
      />
      <h2 className="pageTitle">{mode === "edit" ? "Edit Blog" : "New Blog"}</h2>

      <div className="bfCard">
        <label className="bfImageBox">
          {form.imageDataUrl ? (
            <img className="bfPreview" src={form.imageDataUrl} alt="blog" />
          ) : (
            <div className="bfPh">
              <div className="bfIcon">🖼️</div>
              <div>Add image</div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickImage} hidden />
        </label>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btnSave"
            onClick={() => fileInputRef.current?.click()}
            title="Change image"
          >
            Change image
          </button>
          {form.imageDataUrl && (
            <button
              type="button"
              className="btnCancel"
              onClick={() => setField("imageDataUrl", "")}
              title="Remove current image"
            >
              Remove image
            </button>
          )}
        </div>

        <div className="bfField">
          <div className="bfLabel">Title</div>
          <input className="bfInput" value={form.title} onChange={(e) => setField("title", e.target.value)} />
        </div>

        <div className="bfField">
          <div className="bfLabel">Description</div>
          <textarea className="bfTextarea" rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} />
        </div>

        <div className="bfRow3">
          <div className="bfField">
            <div className="bfLabel">Published Date & Time</div>
            <input className="bfInput" type="datetime-local" value={form.publishedDate} onChange={(e) => setField("publishedDate", e.target.value)} />
          </div>

          <div className="bfField">
            <div className="bfLabel">Read Time</div>
            <CustomSelect
              value={form.readTime}
              onChange={(val) => setField("readTime", val)}
              options={OPTIONS.readTime}
              placeholder="Select time"
            />
          </div>

          <div className="bfField">
            <div className="bfLabel">Category</div>
            <CustomSelect
              value={form.category}
              onChange={(val) => setField("category", val)}
              options={OPTIONS.category}
              placeholder="Choose category"
            />
          </div>
        </div>

        <div className="bfField">
          <div className="bfLabel">Author</div>
          <input className="bfInput" value={form.author} onChange={(e) => setField("author", e.target.value)} />
        </div>

        <div className="bfField bfStatusRow">
          <div className="bfLabel">Publication Status</div>
          <div className="bfStatusChips">
            <button
              type="button"
              className={`pill status ${form.status === "Active" ? "on" : "off"}`}
              onClick={() => setField("status", "Active")}
            >
              <span className="statusText">Open</span>
              <span className="statusSubtext">Published</span>
            </button>
            <button
              type="button"
              className={`pill status ${form.status === "Inactive" ? "on" : "off"}`}
              onClick={() => setField("status", "Inactive")}
            >
              <span className="statusText">Closed</span>
              <span className="statusSubtext">Draft</span>
            </button>
          </div>
          {form.status === "Active" ? (
            <div style={{ 
              fontSize: '12px', 
              color: '#155724', 
              fontWeight: '600',
              marginTop: '12px',
              padding: '12px 16px',
              background: '#d4edda',
              borderRadius: '8px',
              border: '2px solid #28a745',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>✓</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>Currently Published</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>This blog is visible to all users</div>
              </div>
            </div>
          ) : (
            <div style={{ 
              fontSize: '12px', 
              color: '#721c24', 
              fontWeight: '600',
              marginTop: '12px',
              padding: '12px 16px',
              background: '#f8d7da',
              borderRadius: '8px',
              border: '2px solid #dc3545',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>Currently in Draft</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>This blog is hidden from users</div>
              </div>
            </div>
          )}
        </div>

        <div className="bfField">
          <div className="bfLabel">Manual Link (our post)</div>
          <input
            className="bfInput"
            type="url"
            value={form.manualUrl}
            onChange={(e) => setField("manualUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="bfField">
          <div className="bfLabel">Reference Link (source)</div>
          <input
            className="bfInput"
            type="url"
            value={form.referenceUrl}
            onChange={(e) => setField("referenceUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="bfField">
          <div className="bfLabel">Content</div>
          <textarea className="bfTextarea big" rows={10} value={form.content} onChange={(e) => setField("content", e.target.value)} />
        </div>
      </div>

      <div className="formActions" style={{maxWidth: '1200px', margin: '0 auto'}}>
        <button className="btnSave" onClick={save} disabled={!canSave}>
          Save
        </button>
        <button className="btnCancel" onClick={() => navigate("/admin/blog")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
