import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./Blog.module.css";
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

function mapAdminBlogToUser(blog) {
  const safeContent = typeof blog?.content === "string" ? blog.content : "";

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
    imageDataUrl: blog?.imageDataUrl || blog?.image_url || blog?.image || "",
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

  const heroCategory = mainPost?.category || "Event news";
  const heroPublished = mainPost?.published || "December 15, 2025";
  const heroTitle =
    mainPost?.title || "Stay informed with the latest implant insights";
  const heroExcerpt =
    mainPost?.excerpt ||
    "Explore updates, clinical perspectives, and event highlights from across the implant dentistry community.";

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
                  <div className={styles.heroPlaceholder} aria-hidden="true">
                    <svg viewBox="0 0 480 360" className={styles.heroPlaceholderArt}>
                      <defs>
                        <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0f5ec9" stopOpacity="1" />
                          <stop offset="100%" stopColor="#0b2c67" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <rect width="480" height="360" fill="url(#heroGradient)" />
                      <circle cx="150" cy="120" r="54" fill="rgba(255,255,255,0.16)" />
                      <circle cx="320" cy="110" r="42" fill="rgba(255,255,255,0.12)" />
                      <circle cx="260" cy="220" r="36" fill="rgba(255,255,255,0.1)" />
                      <path
                        d="M 90 260 Q 240 190 390 260"
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <text
                        x="240"
                        y="302"
                        fontFamily="'Segoe UI', sans-serif"
                        fontSize="40"
                        fill="rgba(255,255,255,0.35)"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        🦷
                      </text>
                    </svg>
                  </div>
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
                  const cardCategory = post.category || "News";

                  return (
                    <article key={post.slug} className={styles.latestCard}>
                      <Link to={`/blog/${post.slug}`} className={styles.cardInner}>
                        <div className={styles.cardImageWrapper}>
                          {post.imageDataUrl ? (
                            <img
                              src={post.imageDataUrl}
                              alt={post.title}
                              className={styles.cardImage}
                            />
                          ) : (
                            <div className={styles.cardPlaceholder} aria-hidden="true">
                              <svg viewBox="0 0 340 220" className={styles.cardPlaceholderArt}>
                                <defs>
                                  <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0d4dab" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#0a3275" stopOpacity="1" />
                                  </linearGradient>
                                </defs>
                                <rect width="340" height="220" fill="url(#cardGradient)" />
                                <circle cx="170" cy="90" r="42" fill="rgba(255,255,255,0.18)" />
                                <circle cx="120" cy="150" r="28" fill="rgba(255,255,255,0.14)" />
                                <circle cx="220" cy="150" r="28" fill="rgba(255,255,255,0.14)" />
                                <path
                                  d="M 80 170 Q 170 140 260 170"
                                  stroke="rgba(255,255,255,0.2)"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <text
                                  x="170"
                                  y="196"
                                  fontFamily="'Segoe UI', sans-serif"
                                  fontSize="28"
                                  fill="rgba(255,255,255,0.3)"
                                  textAnchor="middle"
                                  fontWeight="600"
                                >
                                  🦷
                                </text>
                              </svg>
                            </div>
                          )}

                          <span className={styles.cardCategory}>{cardCategory}</span>

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