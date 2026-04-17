import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./BlogDetail.module.css";
import { blogsAPI } from "../../services/api.js";

const BLOG_KEY = "admin_blogs_v1";
const DELETED_BLOGS_KEY = "deleted_blog_ids";
const BLOGS_UPDATED_EVENT = "blogs:updated";

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const opts = { year: "numeric", month: "long", day: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  } catch {
    return String(iso);
  }
};

const mapAdminBlogToUser = (blog) => {
  const safeContent = typeof blog?.content === "string" ? blog.content : "";

  const id = blog?.id ?? blog?.blog_id ?? null;

  return {
    id,
    slug: `${slugify(blog?.title)}-${id ?? ""}`,
    title: blog?.title || "",
    published: formatDate(blog?.publishedDate || blog?.published_date),
    publishedDate: blog?.publishedDate || blog?.published_date || "",
    category: blog?.category || blog?.category_name || "News",
    excerpt: blog?.description || "",
    author: blog?.author || blog?.author_name || "",
    readTime: blog?.readTime || blog?.read_time || "",
    imageDataUrl: blog?.imageDataUrl || blog?.image_url || blog?.image || "",
    manualUrl: blog?.manualUrl || blog?.manual_url || "",
    referenceUrl: blog?.referenceUrl || blog?.reference_url || "",
    status: blog?.status || "Active",
    content: safeContent
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p}</p>`)
      .join(""),
  };
};

const readDeletedBlogIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_BLOGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readLocalBlogs = () => {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    const arr = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(arr)) return [];

    const deletedIds = readDeletedBlogIds();

    return arr
      .filter((b) => (b.status || "Active") === "Active")
      .filter((b) => !deletedIds.includes(b.id ?? b.blog_id))
      .sort(
        (a, b) =>
          new Date(b.publishedDate || b.published_date || 0) -
          new Date(a.publishedDate || a.published_date || 0)
      )
      .map(mapAdminBlogToUser);
  } catch {
    return [];
  }
};

const saveBlogsToLocal = (blogs) => {
  try {
    if (!Array.isArray(blogs)) return;
    localStorage.setItem(BLOG_KEY, JSON.stringify(blogs));
    window.dispatchEvent(new Event(BLOGS_UPDATED_EVENT));
  } catch (err) {
    console.error("Unable to save blogs locally:", err);
  }
};

const getBlogs = async () => {
  try {
    const apiBlogs = await blogsAPI.getAll();

    if (Array.isArray(apiBlogs)) {
      saveBlogsToLocal(apiBlogs);

      const deletedIds = readDeletedBlogIds();

      return apiBlogs
        .filter((entry) => (entry.status || "Active") === "Active")
        .filter((entry) => !deletedIds.includes(entry.id ?? entry.blog_id))
        .sort(
          (a, b) =>
            new Date(b.publishedDate || b.published_date || 0) -
            new Date(a.publishedDate || a.published_date || 0)
        )
        .map(mapAdminBlogToUser);
    }

    return readLocalBlogs();
  } catch (err) {
    console.error("Failed to fetch blogs from API, fallback to localStorage:", err);
    return readLocalBlogs();
  }
};

const getRelatedBlogs = (posts, currentPost, limit = 2) => {
  if (!Array.isArray(posts) || !currentPost) return [];

  return posts
    .filter(
      (post) =>
        post.category === currentPost.category && post.slug !== currentPost.slug
    )
    .slice(0, limit);
};

export default function BlogDetail() {
  const { slug } = useParams();
  const [posts, setPosts] = useState(() => readLocalBlogs());
  const [loading, setLoading] = useState(posts.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError("");

        const blogs = await getBlogs();

        if (!isMounted) return;
        setPosts(Array.isArray(blogs) ? blogs : []);
      } catch (err) {
        console.error("Failed to load blog detail:", err);
        if (!isMounted) return;
        setError("Unable to load blog post.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBlogs();

    const refresh = () => {
      setPosts(readLocalBlogs());
    };

    window.addEventListener("storage", refresh);
    window.addEventListener(BLOGS_UPDATED_EVENT, refresh);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener(BLOGS_UPDATED_EVENT, refresh);
    };
  }, []);

  const post = useMemo(() => posts.find((x) => x.slug === slug) || null, [posts, slug]);
  const relatedPosts = useMemo(() => getRelatedBlogs(posts, post, 2), [posts, post]);

  if (loading && !post) return <div style={{ padding: 90 }}>Loading post...</div>;
  if (error && !post) return <div style={{ padding: 90, color: "red" }}>{error}</div>;
  if (!post) return <div style={{ padding: 90 }}>Post not found</div>;

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Blog", to: "/blog" },
          { label: post.title },
        ]}
      />

      <div className={styles.container}>
        <article className={styles.article}>
          {post.imageDataUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <img
                src={post.imageDataUrl}
                alt={post.title}
                style={{
                  width: "100%",
                  maxWidth: "700px",
                  aspectRatio: "16/9",
                  maxHeight: "380px",
                  objectFit: "cover",
                  borderRadius: "18px",
                  boxShadow: "0 8px 32px rgba(31,47,74,0.13)",
                  border: "2px solid #e0e7ef",
                  background: "#f8f9fa",
                }}
              />
            </div>
          )}

          <header className={styles.header}>
            <div className={styles.categoryBadge}>{post.category}</div>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <span className={styles.metaIcon}>📅</span>
              <span>Published: {post.published}</span>
            </div>
            <p className={styles.excerpt}>{post.excerpt}</p>
          </header>

          {(post.manualUrl || post.referenceUrl) && (
            <section className={styles.resourcesSection}>
              <div className={styles.resourcesCopy}>
                <span className={styles.resourcesEyebrow}>Additional Resources</span>
                <h2 className={styles.resourcesTitle}>Supporting Clinical Documentation</h2>
                <p className={styles.resourcesSubtitle}>
                  Access complementary materials that expand on the insights
                  discussed in this article.
                </p>
              </div>

              <div className={styles.resourcesActions}>
                {post.manualUrl && (
                  <a
                    href={post.manualUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.resourceButton}
                  >
                    📄 Read Our Analysis
                  </a>
                )}

                {post.referenceUrl && (
                  <a
                    href={post.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.resourceButton} ${styles.referenceButton}`}
                  >
                    🔗 View Reference Source
                  </a>
                )}
              </div>
            </section>
          )}

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className={styles.footer}>
            <div className={styles.tags}>
              <span className={styles.tagLabel}>Tags:</span>
              <span className={styles.tag}>Dental Implants</span>
              <span className={styles.tag}>{post.category}</span>
              <span className={styles.tag}>Clinical Research</span>
            </div>
          </footer>
        </article>

        {relatedPosts.length > 0 && (
          <aside className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Articles</h2>

            <div className={styles.relatedGrid}>
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  to={`/blog/${relatedPost.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    <span className={styles.relatedIcon}>🦷</span>
                  </div>

                  <div className={styles.relatedContent}>
                    <div className={styles.relatedCategory}>
                      {relatedPost.category}
                    </div>
                    <h3 className={styles.relatedCardTitle}>{relatedPost.title}</h3>
                    <p className={styles.relatedExcerpt}>{relatedPost.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.backToBlogs}>
              <Link to="/blog" className={styles.backButton}>
                ← Back to All Articles
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}