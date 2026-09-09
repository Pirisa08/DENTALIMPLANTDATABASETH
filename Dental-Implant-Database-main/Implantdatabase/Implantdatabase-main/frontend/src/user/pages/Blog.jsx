import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./Blog.module.css";
import { blogsAPI, resolveImageUrl } from "../../services/api.js";

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

function mapAdminBlogToUser(blog) {
  const safeContent = typeof blog?.content === "string" ? blog.content : "";
  const imageValue =
    blog?.imageDataUrl || blog?.image_url || blog?.image || blog?.thumbnail || "";

  return {
    id: blog?.id ?? blog?.blog_id ?? null,
    slug: `${slugify(blog?.title)}-${blog?.id ?? blog?.blog_id ?? ""}`,
    title: blog?.title || "",
    published: formatDate(blog?.publishedDate || blog?.published_date),
    publishedDate: blog?.publishedDate || blog?.published_date || "",
    category: blog?.category || blog?.category_name || "News",
    excerpt: blog?.description || "",
    author: blog?.author || blog?.author_name || "",
    readTime: blog?.readTime || blog?.read_time || "",
    imageDataUrl: resolveImageUrl(imageValue),
    manualUrl: blog?.manualUrl || blog?.manual_url || "",
    referenceUrl: blog?.referenceUrl || blog?.reference_url || "",
    status: blog?.status || "Active",
    content: safeContent
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join(""),
  };
}

const EditorialPlaceholder = ({ className = "", iconClassName = "", title = "Editorial update", category = "News" }) => (
  <div className={`${styles.editorialPlaceholder} ${className}`} aria-hidden="true">
    <div className={styles.placeholderMark}>
      <svg viewBox="0 0 28 28" className={iconClassName}>
        <path d="M8 4.5h8.2L21 9.3v14.2H8v-19Z" />
        <path d="M16 4.8v5h5" />
        <path d="M10.8 14h6.4M10.8 17h6.4M10.8 20h4.2" />
      </svg>
    </div>
    <div className={styles.placeholderCopy}>
      <span>{category || "News"}</span>
      <strong>{title || "Editorial update"}</strong>
    </div>
  </div>
);

function readDeletedBlogIds() {
  try {
    const raw = localStorage.getItem(DELETED_BLOGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLocalBlogs() {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const deletedIds = readDeletedBlogIds();

    return parsed
      .filter((entry) => (entry.status || "Active") === "Active")
      .filter((entry) => !deletedIds.includes(entry.id ?? entry.blog_id))
      .sort(
        (a, b) =>
          new Date(b.publishedDate || b.published_date || 0) -
          new Date(a.publishedDate || a.published_date || 0)
      )
      .map((entry) => mapAdminBlogToUser(entry));
  } catch {
    return [];
  }
}

function saveBlogsToLocal(blogs) {
  try {
    if (!Array.isArray(blogs)) return;
    localStorage.setItem(BLOG_KEY, JSON.stringify(blogs));
    window.dispatchEvent(new Event(BLOGS_UPDATED_EVENT));
  } catch (err) {
    console.error("Unable to save blogs locally:", err);
  }
}

async function getBlogs() {
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
        .map((entry) => mapAdminBlogToUser(entry));
    }

    return readLocalBlogs();
  } catch (err) {
    console.error("Failed to load blogs from API, fallback to localStorage:", err);
    return readLocalBlogs();
  }
}

function Blog() {
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
        console.error("Failed to load blogs", err);
        if (!isMounted) return;
        setError("Unable to load blog posts.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBlogs();

    const refreshLocal = () => {
      setPosts(readLocalBlogs());
    };

    window.addEventListener("storage", refreshLocal);
    window.addEventListener(BLOGS_UPDATED_EVENT, refreshLocal);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", refreshLocal);
      window.removeEventListener(BLOGS_UPDATED_EVENT, refreshLocal);
    };
  }, []);

  const mainPost = useMemo(() => (posts.length > 0 ? posts[0] : null), [posts]);
  const latestPosts = useMemo(() => (posts.length > 1 ? posts.slice(1) : []), [posts]);

  const heroCategory = mainPost?.category || "Clinical Research";
  const heroPublished = mainPost?.published || "April 20, 2026";
  const heroTitle =
    mainPost?.title || "Implant Materials: Titanium vs Zirconia";
  const heroExcerpt =
    mainPost?.excerpt ||
    "A comprehensive comparison of titanium and zirconia implants, their advantages, disadvantages, and clinical applications.";

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Blog" },
        ]}
      />

      <div className={styles.pageContainer}>
        {loading && posts.length === 0 ? (
          <div style={{ padding: "40px 0" }}>Loading blog posts...</div>
        ) : error && posts.length === 0 ? (
          <div style={{ padding: "40px 0", color: "red" }}>{error}</div>
        ) : (
          <>
            <section className={styles.heroSection}>
              <div className={styles.heroImageWrapper}>
                {mainPost?.imageDataUrl ? (
                  <Link to={`/blog/${mainPost.slug}`} className={styles.heroImageLink}>
                    <img
                      src={mainPost.imageDataUrl}
                      alt={heroTitle}
                      className={styles.heroImage}
                    />
                  </Link>
                ) : (
                  <EditorialPlaceholder
                    className={styles.heroPlaceholder}
                    title={heroTitle}
                    category={heroCategory}
                  />
                )}
              </div>

              <div className={styles.heroContent}>
                <span className={styles.heroEyebrow}>{heroCategory}</span>

                {mainPost && (mainPost.manualUrl || mainPost.referenceUrl) && (
                  <div className={styles.heroReferenceBadges}>
                    {mainPost.manualUrl && (
                      <a
                        href={mainPost.manualUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.heroReferenceBadge}
                        onClick={(e) => e.stopPropagation()}
                      >
                        📄 Documentation
                      </a>
                    )}

                    {mainPost.referenceUrl && (
                      <a
                        href={mainPost.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.heroReferenceBadge}
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 Reference
                      </a>
                    )}
                  </div>
                )}

                <span className={styles.heroDate}>{heroPublished}</span>
                <h1 className={styles.heroTitle}>{heroTitle}</h1>
                <p className={styles.heroExcerpt}>{heroExcerpt}</p>

                {mainPost ? (
                  <Link to={`/blog/${mainPost.slug}`} className={styles.heroLink}>
                    <span>Read more</span>
                    <span aria-hidden="true" className={styles.heroLinkIcon}>
                      →
                    </span>
                  </Link>
                ) : null}
              </div>
            </section>

            <section className={styles.sectionIntro}>
              <h2 className={styles.sectionHeading}>Latest newsroom highlights</h2>
              <p className={styles.sectionCopy}>
                Discover corporate announcements, educational spotlights, and event
                coverage curated for implant professionals and partners.
              </p>
            </section>

            <section className={styles.latestSection}>
              <div className={styles.latestGrid}>
                {latestPosts.map((post) => {
                  const cardDate = post.published || "Date to be announced";
                  const hasCardImage = Boolean(post.imageDataUrl);

                  return (
                    <article key={post.slug} className={styles.latestCard}>
                      <Link to={`/blog/${post.slug}`} className={styles.cardInner}>
                        <div className={styles.cardImageWrapper}>
                          {hasCardImage ? (
                            <>
                              <img
                                src={post.imageDataUrl}
                                alt={post.title}
                                className={styles.cardImage}
                              />

                              <span className={styles.cardCategory}>
                                {post.category || "News"}
                              </span>

                              {(post.manualUrl || post.referenceUrl) && (
                                <div className={styles.cardReferenceBadges}>
                                  {post.manualUrl && (
                                    <a
                                      href={post.manualUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={styles.cardReferenceBadge}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      📄
                                    </a>
                                  )}

                                  {post.referenceUrl && (
                                    <a
                                      href={post.referenceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={styles.cardReferenceBadge}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      🔗
                                    </a>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <EditorialPlaceholder
                              className={styles.cardPlaceholder}
                              title={post.title}
                              category={post.category}
                            />
                          )}
                        </div>

                        <div className={styles.cardBody}>
                          <span className={styles.cardDate}>{cardDate}</span>
                          <h3 className={styles.cardTitle}>{post.title}</h3>
                          <p className={styles.cardExcerpt}>{post.excerpt}</p>
                          <span className={styles.cardLink}>
                            <span>Read more</span>
                            <span aria-hidden="true" className={styles.cardLinkIcon}>
                              →
                            </span>
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Blog;
