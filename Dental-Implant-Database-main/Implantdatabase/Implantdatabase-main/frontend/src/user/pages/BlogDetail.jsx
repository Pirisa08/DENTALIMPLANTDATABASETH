import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./BlogDetail.module.css";
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
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(iso);
  }
};

const normalizeHtmlContent = (value) => {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtml) return trimmed;

  return trimmed
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
};

const mapAdminBlogToUser = (blog) => {
  const id = blog?.id ?? blog?.blog_id ?? null;

  const imageValue =
    blog?.imageDataUrl ||
    blog?.image_url ||
    blog?.image ||
    blog?.thumbnail ||
    "";

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
    imageDataUrl: resolveImageUrl(imageValue),
    manualUrl: blog?.manualUrl || blog?.manual_url || "",
    referenceUrl: blog?.referenceUrl || blog?.reference_url || "",
    status: blog?.status || "Active",
    content: normalizeHtmlContent(blog?.content),
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
        .map((entry) => mapAdminBlogToUser(entry));
    }

    return readLocalBlogs();
  } catch (err) {
    console.error("Failed to load blogs from API, fallback to localStorage:", err);
    return readLocalBlogs();
  }
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
        console.error("Failed to load blog detail", err);
        if (!isMounted) return;
        setError("Unable to load article.");
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

  const post = useMemo(() => {
    if (!slug) return null;
    return posts.find((entry) => entry.slug === slug) || null;
  }, [posts, slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];

    return posts
      .filter((entry) => entry.slug !== post.slug)
      .sort((a, b) => {
        const sameCategoryA = a.category === post.category ? 1 : 0;
        const sameCategoryB = b.category === post.category ? 1 : 0;

        if (sameCategoryA !== sameCategoryB) {
          return sameCategoryB - sameCategoryA;
        }

        return (
          new Date(b.publishedDate || 0).getTime() -
          new Date(a.publishedDate || 0).getTime()
        );
      })
      .slice(0, 4);
  }, [posts, post]);

  if (loading && !post) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.article}>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.article}>{error}</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.article}>
            <h1 className={styles.title}>Article not found</h1>
            <div className={styles.sidebarFooter}>
              <Link to="/blog" className={styles.backButton}>
                Back to Blogs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tags = [post.category, post.author, post.readTime].filter(Boolean);

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
        <div className={styles.layout}>
          <main className={styles.mainColumn}>
            <article className={styles.article}>
              <header className={styles.header}>
                <span className={styles.categoryBadge}>{post.category}</span>
                <h1 className={styles.title}>{post.title}</h1>

                <div className={styles.meta}>
                  {post.published ? <span>{post.published}</span> : null}
                  {post.author ? (
                    <>
                      <span>•</span>
                      <span>{post.author}</span>
                    </>
                  ) : null}
                  {post.readTime ? (
                    <>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </>
                  ) : null}
                </div>

                {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
              </header>

              {post.imageDataUrl ? (
                <div className={styles.featuredMedia}>
                  <img
                    src={post.imageDataUrl}
                    alt={post.title}
                    className={styles.featuredImage}
                  />
                </div>
              ) : null}

              {(post.manualUrl || post.referenceUrl) && (
                <section className={styles.resourcesSection}>
                  <div className={styles.resourcesCopy}>
                    <span className={styles.resourcesEyebrow}>Resources</span>
                    <h2 className={styles.resourcesTitle}>Supporting materials</h2>
                    <p className={styles.resourcesSubtitle}>
                      Access additional documentation and external references for this
                      article.
                    </p>
                  </div>

                  <div className={styles.resourcesActions}>
                    {post.manualUrl ? (
                      <a
                        href={post.manualUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.resourceButton}
                      >
                        Documentation
                      </a>
                    ) : null}

                    {post.referenceUrl ? (
                      <a
                        href={post.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.resourceButton} ${styles.referenceButton}`}
                      >
                        Reference
                      </a>
                    ) : null}
                  </div>
                </section>
              )}

              <section
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html: post.content || "<p>No content available.</p>",
                }}
              />

              {tags.length > 0 && (
                <footer className={styles.footer}>
                  <div className={styles.tags}>
                    <span className={styles.tagLabel}>Tags:</span>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
            </article>
          </main>

          <aside className={styles.sidebarColumn}>
            {relatedPosts.length > 0 && (
              <section className={styles.relatedSidebar}>
                <h2 className={styles.sidebarTitle}>Related Articles</h2>

                <div className={styles.sidebarList}>
                  {relatedPosts.map((related) => {
                    const hasImage = Boolean(related.imageDataUrl);

                    return (
                      <Link
                        key={related.slug}
                        to={`/blog/${related.slug}`}
                        className={styles.sidebarItem}
                      >
                        <div className={styles.sidebarThumb}>
                          {hasImage ? (
                            <img
                              src={related.imageDataUrl}
                              alt={related.title}
                              className={styles.sidebarThumbImage}
                            />
                          ) : (
                            <div className={styles.sidebarThumbPlaceholder}>
                              <div className={styles.sidebarThumbPlaceholderPanel}>
                                <span className={styles.sidebarThumbBarLong} />
                                <span className={styles.sidebarThumbBarShort} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={styles.sidebarText}>
                          <h3 className={styles.sidebarItemTitle}>{related.title}</h3>
                          <p className={styles.sidebarItemMeta}>
                            {related.published || related.category || "Read article"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className={styles.sidebarFooter}>
                  <Link to="/blog" className={styles.backButton}>
                    Back to Blogs
                  </Link>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}