import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { adminAlert } from "../components/adminDialog.js";
import { blogsAPI } from "../../services/api.js";
import { buildBlogPreviewPost } from "./blogPreview.js";
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

function BlogRichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    block: "",
    fontFamily: "",
    fontSize: "",
  });

  const fontOptions = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Tahoma", value: "Tahoma, sans-serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
  ];

  const fontSizeOptions = ["12", "14", "16", "18", "20", "24", "28", "32"];

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  const updateValue = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const getSelectionElement = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return null;

    let node = selection.anchorNode;
    if (!node || !editor.contains(node)) return null;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    return node instanceof HTMLElement ? node : null;
  };

  const findStyleValue = (property) => {
    const editor = editorRef.current;
    let node = getSelectionElement();

    while (node && editor?.contains(node)) {
      if (node.style?.[property]) return node.style[property];
      node = node.parentElement;
    }

    return "";
  };

  const normalizeFontFamily = (value) => {
    if (!value) return "";
    const cleaned = value.replaceAll('"', "'").toLowerCase();
    return fontOptions.find((option) => {
      const optionValue = option.value.replaceAll('"', "'").toLowerCase();
      const firstFamily = optionValue.split(",")[0].replaceAll("'", "").trim();
      return cleaned.includes(firstFamily);
    })?.value || "";
  };

  const refreshActiveFormats = () => {
    const selectedElement = getSelectionElement();
    const tagName = selectedElement?.tagName?.toLowerCase() || "";
    const fontSize = findStyleValue("fontSize").replace("px", "");
    const fontFamily = normalizeFontFamily(findStyleValue("fontFamily"));

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      block: ["h2", "h3", "h4"].includes(tagName) ? tagName : "",
      fontFamily,
      fontSize: fontSizeOptions.includes(fontSize) ? fontSize : "",
    });
  };

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActiveFormats);
    return () => {
      document.removeEventListener("selectionchange", refreshActiveFormats);
    };
  }, []);

  const runCommand = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateValue();
    refreshActiveFormats();
  };

  const applyInlineStyle = (styleName, styleValue) => {
    const editor = editorRef.current;
    if (!editor || !styleValue) return;

    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      const span = document.createElement("span");
      span.style[styleName] = styleValue;
      span.appendChild(document.createTextNode("\u200b"));

      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      range.insertNode(span);
      range.setStart(span.firstChild, 1);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      updateValue();
      refreshActiveFormats();
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("span");
    span.style[styleName] = styleValue;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    nextRange.collapse(false);
    selection.addRange(nextRange);
    updateValue();
    refreshActiveFormats();
  };

  const applyFontSize = (size) => {
    applyInlineStyle("fontSize", `${size}px`);
  };

  const applyFontFamily = (fontFamily) => {
    applyInlineStyle("fontFamily", fontFamily);
  };

  return (
    <div className="bfRichEditor">
      <div className="bfEditorToolbar" aria-label="Blog content formatting">
        <select
          className="bfEditorSelect"
          value={activeFormats.block}
          onChange={(e) => {
            runCommand("formatBlock", e.target.value || "p");
          }}
          title="Text style"
        >
          <option value="">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <select
          className={`bfEditorSelect ${
            activeFormats.fontFamily ? "isActive" : ""
          }`}
          value={activeFormats.fontFamily}
          onChange={(e) => {
            if (!e.target.value) return;
            applyFontFamily(e.target.value);
          }}
          title="Font family"
        >
          <option value="">Font</option>
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className={`bfEditorSelect ${
            activeFormats.fontSize ? "isActive" : ""
          }`}
          value={activeFormats.fontSize}
          onChange={(e) => {
            if (!e.target.value) return;
            applyFontSize(e.target.value);
          }}
          title="Font size"
        >
          <option value="">Font size</option>
          {fontSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} px
            </option>
          ))}
        </select>

        <button
          type="button"
          className={activeFormats.bold ? "isActive" : ""}
          onClick={() => runCommand("bold")}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          className={activeFormats.italic ? "isActive" : ""}
          onClick={() => runCommand("italic")}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          className={activeFormats.underline ? "isActive" : ""}
          onClick={() => runCommand("underline")}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          className={activeFormats.strikeThrough ? "isActive" : ""}
          onClick={() => runCommand("strikeThrough")}
          title="Strike"
        >
          S
        </button>
        <button
          type="button"
          className={activeFormats.unorderedList ? "isActive" : ""}
          onClick={() => runCommand("insertUnorderedList")}
          title="Bulleted list"
        >
          Bullet
        </button>
        <button
          type="button"
          className={activeFormats.orderedList ? "isActive" : ""}
          onClick={() => runCommand("insertOrderedList")}
          title="Numbered list"
        >
          1.
        </button>
        <button
          type="button"
          className={activeFormats.justifyLeft ? "isActive" : ""}
          onClick={() => runCommand("justifyLeft")}
          title="Align left"
        >
          Left
        </button>
        <button
          type="button"
          className={activeFormats.justifyCenter ? "isActive" : ""}
          onClick={() => runCommand("justifyCenter")}
          title="Align center"
        >
          Center
        </button>
        <button
          type="button"
          className={activeFormats.justifyRight ? "isActive" : ""}
          onClick={() => runCommand("justifyRight")}
          title="Align right"
        >
          Right
        </button>
        <button type="button" onClick={() => runCommand("removeFormat")} title="Clear formatting">
          Clear
        </button>
      </div>

      <div
        ref={editorRef}
        className="bfEditorArea"
        contentEditable
        suppressContentEditableWarning
        onInput={updateValue}
        onBlur={updateValue}
      />
    </div>
  );
}

function BlogPreviewModal({ post, mode, onModeChange, onClose }) {
  return (
    <div className="bfPreviewOverlay" onClick={onClose}>
      <section className="bfPreviewModal" onClick={(e) => e.stopPropagation()}>
        <div className="bfPreviewHeader">
          <div>
            <span className="bfPreviewEyebrow">Blog preview</span>
            <h3>Preview before publishing</h3>
          </div>

          <button
            type="button"
            className="bfPreviewClose"
            onClick={onClose}
            aria-label="Close preview"
            title="Close preview"
          >
            x
          </button>
        </div>

        <div className="bfPreviewTabs" role="tablist" aria-label="Preview mode">
          <button
            type="button"
            className={mode === "card" ? "active" : ""}
            onClick={() => onModeChange("card")}
          >
            Blog list
          </button>
          <button
            type="button"
            className={mode === "article" ? "active" : ""}
            onClick={() => onModeChange("article")}
          >
            Full article
          </button>
        </div>

        <div className="bfPreviewScroll">
          {mode === "card" ? (
            <div className="bfPreviewListFrame">
              <article className="bfPreviewHeroCard">
                <div className="bfPreviewHeroMedia">
                  {post.imageDataUrl ? (
                    <img src={post.imageDataUrl} alt={post.title} />
                  ) : (
                    <div className="bfPreviewImageEmpty">
                      <span>{post.category}</span>
                      <strong>{post.title}</strong>
                    </div>
                  )}
                </div>

                <div className="bfPreviewHeroCopy">
                  <span className="bfPreviewCategory">{post.category}</span>
                  <span className="bfPreviewDate">{post.published}</span>
                  <h1>{post.title}</h1>
                  <p>{post.excerpt}</p>
                  <span className="bfPreviewReadMore">Read more</span>
                </div>
              </article>

              <div className="bfPreviewGrid">
                {[0, 1, 2].map((item) => (
                  <article className="bfPreviewSmallCard" key={item}>
                    <div className="bfPreviewSmallMedia">
                      {post.imageDataUrl ? (
                        <img src={post.imageDataUrl} alt="" />
                      ) : (
                        <span>{post.category}</span>
                      )}
                    </div>
                    <div className="bfPreviewSmallBody">
                      <span>{post.published}</span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <article className="bfPreviewArticle">
              <header className="bfPreviewArticleHeader">
                <span className="bfPreviewCategory">{post.category}</span>
                <h1>{post.title}</h1>
                <div className="bfPreviewMeta">
                  <span>{post.published}</span>
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                  <span>{post.statusLabel}</span>
                </div>
                <p>{post.excerpt}</p>
              </header>

              <div className="bfPreviewArticleMedia">
                {post.imageDataUrl ? (
                  <img src={post.imageDataUrl} alt={post.title} />
                ) : (
                  <div className="bfPreviewImageEmpty">
                    <span>{post.category}</span>
                    <strong>{post.title}</strong>
                  </div>
                )}
              </div>

              {(post.manualUrl || post.referenceUrl) && (
                <div className="bfPreviewResources">
                  {post.manualUrl && <span>Documentation</span>}
                  {post.referenceUrl && <span>Reference</span>}
                </div>
              )}

              <section
                className="bfPreviewContent"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BlogForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState("article");

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
        await adminAlert({
          title: "Unable to load blog",
          message: err.message || "Unable to load blog",
          icon: "error",
        });
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

  const previewPost = useMemo(() => buildBlogPreviewPost(form), [form]);

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
      await adminAlert({
        title: "Missing required fields",
        message: "Please fill all required fields before saving.",
        icon: "warning",
      });
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
        await adminAlert({
          title: "Blog updated",
          message: "Blog updated successfully.",
          icon: "success",
        });
      } else {
        await blogsAPI.create(payload);
        await adminAlert({
          title: "Blog created",
          message: "Blog created successfully.",
          icon: "success",
        });
      }

      navigate("/admin/blog");
    } catch (err) {
      console.error("Failed to save blog:", err);
      await adminAlert({
        title: "Unable to save blog",
        message: err.message || "Unable to save blog",
        icon: "error",
      });
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
              <BlogRichTextEditor
                value={form.content}
                onChange={(value) => setField("content", value)}
              />
            </div>
          </div>

          <div className="formActions" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <button
              className="btnPreview"
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={saving}
            >
              Preview
            </button>
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

          {previewOpen && (
            <BlogPreviewModal
              post={previewPost}
              mode={previewMode}
              onModeChange={setPreviewMode}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
