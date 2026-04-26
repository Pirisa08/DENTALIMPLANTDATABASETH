import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { blogsAPI } from "../../services/api.js";
import "./BlogForm.css";

const OPTIONS = {
  readTime: ["3 Min", "5 Min", "10 Min"],
  category: [
    "Education",
    "Technology",
    "Clinical Research",
    "Clinical Techniques",
    "Research",
    "News",
  ],
  status: ["Active", "Inactive"],
};

function normalizeBlog(b) {
  if (!b) return null;

  return {
    id: b.id ?? null,
    title: b.title || "",
    description: b.description || "",
    publishedDate: b.publishedDate || "",
    readTime: b.readTime || "",
    category: b.category || "News",
    author: b.author || "",
    content: b.content || "",
    status: b.status || "Active",
    manualUrl: b.manualUrl || "",
    referenceUrl: b.referenceUrl || "",
    imageDataUrl: b.imageDataUrl || b.image || "",
  };
}

function toLocalDatetime(value) {
  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }

  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BlogForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    publishedDate: toLocalDatetime(),
    readTime: "",
    category: "",
    author: "",
    content: "",
    manualUrl: "",
    referenceUrl: "",
    imageDataUrl: "",
    status: "Active",
  });

  useEffect(() => {
    let ignore = false;

    const loadBlog = async () => {
      if (mode !== "edit") {
        setLoading(false);
        return;
      }

      try {
        const data = await blogsAPI.getById(id);
        const found = normalizeBlog(data);

        if (!ignore && found) {
          setForm({
            title: found.title || "",
            description: found.description || "",
            publishedDate: toLocalDatetime(found.publishedDate),
            readTime: found.readTime || "",
            category: found.category || "",
            author: found.author || "",
            content: found.content || "",
            manualUrl: found.manualUrl || "",
            referenceUrl: found.referenceUrl || "",
            imageDataUrl: found.imageDataUrl || "",
            status: found.status || "Active",
          });
        }
      } catch (err) {
        console.error("Unable to load blog:", err);
        alert(err.message || "Unable to load blog");
        navigate("/admin/blog");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadBlog();
    return () => {
      ignore = true;
    };
  }, [id, mode, navigate]);

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

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setField("imageDataUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const save = async () => {
    if (!canSave) {
      alert("Please fill all required fields before saving.");
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      publishedDate: form.publishedDate,
      readTime: form.readTime,
      category: form.category,
      author: form.author.trim(),
      content: form.content.trim(),
      manualUrl: form.manualUrl.trim(),
      referenceUrl: form.referenceUrl.trim(),
      imageDataUrl: form.imageDataUrl,
      image: form.imageDataUrl,
      status: form.status,
    };

    try {
      if (mode === "edit") {
        await blogsAPI.update(id, payload);
        alert("Blog updated successfully");
      } else {
        await blogsAPI.create(payload);
        alert("Blog created successfully");
      }

      navigate("/admin/blog");
    } catch (err) {
      console.error("Failed to save blog:", err);
      alert(err.message || "Unable to save blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bfWrap">
      <AdminSearchBar placeholder="Search blogs…" />
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: mode === "edit" ? "Edit Blog" : "New Blog" },
        ]}
      />

      <h2 className="pageTitle">{mode === "edit" ? "Edit Blog" : "New Blog"}</h2>

      {loading ? (
        <div className="bfCard">
          <div style={{ padding: "24px", textAlign: "center" }}>Loading blog...</div>
        </div>
      ) : (
        <>
          <div className="bfCard">
            <div className="bfImageSection">
              <div className="bfImageBox">
                <div className="bfImageInner">
                  <div className="bfImagePreviewPane">
                    {form.imageDataUrl ? (
                      <img className="bfPreview" src={form.imageDataUrl} alt="blog" />
                    ) : (
                      <div className="bfPh">
                        <div className="bfPhInner">
                          <div className="bfIcon">🖼️</div>
                          <div className="bfPhTitle">Add image</div>
                          <div className="bfPhSub">
                            Upload a cover image for this article.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bfImageActionPane">
                    <div className="bfImageTitle">Cover image</div>
                    <p className="bfImageSub">
                      Use a clear, professional image that matches the topic of the
                      article and looks consistent with the rest of the blog.
                    </p>

                    <div className="bfImageActions">
                      <button
                        type="button"
                        className="bfImageBtn change"
                        onClick={openImagePicker}
                      >
                        {form.imageDataUrl ? "Change image" : "Upload image"}
                      </button>

                      {form.imageDataUrl && (
                        <>
                          <button
                            type="button"
                            className="bfImageBtn remove"
                            onClick={removeImage}
                          >
                            Remove image
                          </button>

                          <button
                            type="button"
                            className="bfImageIconBtn"
                            onClick={removeImage}
                            aria-label="Remove image"
                            title="Remove image"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickImage}
                hidden
              />
            </div>

            <div className="bfField">
              <div className="bfLabel">Title</div>
              <input
                className="bfInput"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </div>

            <div className="bfField">
              <div className="bfLabel">Description</div>
              <textarea
                className="bfTextarea"
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div className="bfRow3">
              <div className="bfField">
                <div className="bfLabel">Published Date & Time</div>
                <input
                  className="bfInput"
                  type="datetime-local"
                  value={form.publishedDate}
                  onChange={(e) => setField("publishedDate", e.target.value)}
                />
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
              <input
                className="bfInput"
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
              />
            </div>

            <div className="bfField">
              <div className="bfLabel">Status</div>
              <CustomSelect
                value={form.status}
                onChange={(val) => setField("status", val)}
                options={OPTIONS.status}
                placeholder="Select status"
              />
            </div>

            <div className="bfField">
              <div className="bfLabel">Manual Link</div>
              <input
                className="bfInput"
                type="url"
                value={form.manualUrl}
                onChange={(e) => setField("manualUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="bfField">
              <div className="bfLabel">Reference Link</div>
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
              <textarea
                className="bfTextarea big"
                rows={10}
                value={form.content}
                onChange={(e) => setField("content", e.target.value)}
              />
            </div>
          </div>

          <div className="formActions" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <button className="btnSave" onClick={save} disabled={!canSave || saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="btnCancel"
              onClick={() => navigate("/admin/blog")}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}