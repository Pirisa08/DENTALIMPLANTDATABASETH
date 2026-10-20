export const formatPreviewDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const normalizePreviewContent = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "<p>No content available.</p>";

  if (/<\/?[a-z][\s\S]*>/i.test(raw)) return raw;

  return raw
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
};

export const buildBlogPreviewPost = (form = {}) => ({
  title: String(form.title || "").trim() || "Untitled blog post",
  excerpt:
    String(form.description || "").trim() ||
    "Article summary will appear here.",
  published: formatPreviewDate(form.publishedDate) || "Date not set",
  publishedDate: form.publishedDate || "",
  readTime: form.readTime || "Read time not set",
  category: form.category || "News",
  author: String(form.author || "").trim() || "Author not set",
  contentHtml: normalizePreviewContent(form.content),
  manualUrl: String(form.manualUrl || "").trim(),
  referenceUrl: String(form.referenceUrl || "").trim(),
  imageDataUrl: form.imageDataUrl || "",
  statusLabel: form.status || "Active",
});

export const getBlogPreviewModes = () => ["article"];
