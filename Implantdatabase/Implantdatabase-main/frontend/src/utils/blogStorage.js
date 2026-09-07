import { blogsAPI } from "../services/api.js";

export const BLOG_KEY = "admin_blogs_v1";
export const DELETED_BLOGS_KEY = "deleted_blog_ids";
export const BLOGS_UPDATED_EVENT = "blogs:updated";

export const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const formatDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const opts = { year: "numeric", month: "long", day: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  } catch {
    return String(iso);
  }
};

export const mapAdminBlogToUser = (blog) => {
  const safeContent = typeof blog?.content === "string" ? blog.content : "";

  return {
    id: blog?.id,
    slug: `${slugify(blog?.title)}-${blog?.id}`,
    title: blog?.title || "",
    published: formatDate(blog?.publishedDate),
    publishedDate: blog?.publishedDate || "",
    category: blog?.category || "News",
    excerpt: blog?.description || "",
    author: blog?.author || "",
    readTime: blog?.readTime || "",
    imageDataUrl: blog?.imageDataUrl || blog?.image || "",
    manualUrl: blog?.manualUrl || "",
    referenceUrl: blog?.referenceUrl || "",
    content: safeContent
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join(""),
    rawContent: safeContent,
    status: blog?.status || "Active",
  };
};

export const readDeletedBlogIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_BLOGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Unable to parse deleted blog ids", err);
    return [];
  }
};

export const readLocalBlogsRaw = () => {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Unable to parse local blog storage", err);
    return [];
  }
};

export const readLocalBlogs = () => {
  try {
    const deletedIds = readDeletedBlogIds();

    return readLocalBlogsRaw()
      .filter((entry) => (entry.status || "Active") === "Active")
      .filter((entry) => !deletedIds.includes(entry.id))
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
      .map(mapAdminBlogToUser);
  } catch (err) {
    console.error("Unable to read local blogs", err);
    return [];
  }
};

export const saveBlogsToLocal = (blogs) => {
  try {
    if (!Array.isArray(blogs)) return;
    localStorage.setItem(BLOG_KEY, JSON.stringify(blogs));
    window.dispatchEvent(new Event(BLOGS_UPDATED_EVENT));
  } catch (err) {
    console.error("Unable to save blogs to localStorage", err);
  }
};

export const getBlogs = async () => {
  try {
    const apiBlogs = await blogsAPI.getAll();

    if (Array.isArray(apiBlogs)) {
      saveBlogsToLocal(apiBlogs);

      const deletedIds = readDeletedBlogIds();

      return apiBlogs
        .filter((entry) => (entry.status || "Active") === "Active")
        .filter((entry) => !deletedIds.includes(entry.id))
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
        .map(mapAdminBlogToUser);
    }

    return readLocalBlogs();
  } catch (err) {
    console.error("API failed, fallback to localStorage", err);
    return readLocalBlogs();
  }
};

export const getBlogById = async (id) => {
  try {
    const result = await blogsAPI.getById(id);
    if (!result) return null;
    return mapAdminBlogToUser(result);
  } catch (err) {
    console.error("Unable to fetch blog by id", err);
    return null;
  }
};

export const getBlogBySlug = async (slug) => {
  const blogs = await getBlogs();
  return blogs.find((blog) => blog.slug === slug) || null;
};

export const getRelatedBlogs = (posts, currentPost, limit = 2) => {
  if (!Array.isArray(posts) || !currentPost) return [];

  return posts
    .filter(
      (post) =>
        post.category === currentPost.category && post.slug !== currentPost.slug
    )
    .slice(0, limit);
};