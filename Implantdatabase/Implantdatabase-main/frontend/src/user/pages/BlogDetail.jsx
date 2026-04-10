import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./BlogDetail.module.css";
import { mockBlogs } from "../../admin/data/implantsMockData";

const BLOG_KEY = 'admin_blogs_v1';
const DELETED_BLOGS_KEY = 'deleted_blog_ids';
const BLOGS_UPDATED_EVENT = 'blogs:updated';

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
  } catch {
    return String(iso);
  }
};

const mapAdminBlogToUser = (b) => ({
  slug: `${slugify(b.title)}-${b.id}`,
  title: b.title,
  published: formatDate(b.publishedDate),
  category: b.category || 'News',
  excerpt: b.description || '',
  author: b.author || '',
  readTime: b.readTime || '',
  imageDataUrl: b.imageDataUrl || b.image || '',
  manualUrl: b.manualUrl || '',
  referenceUrl: b.referenceUrl || '',
  content: (b.content || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`) 
    .join(''),
});

const readAdminBlogs = () => {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr) || arr.length === 0) return [];
    
    // Get deleted blog IDs
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    return arr
      .filter((b) => (b.status || 'Active') === 'Active')
      .filter((b) => !deletedIds.includes(b.id)) // Filter out deleted blogs
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
      .map(mapAdminBlogToUser);
  } catch {
    return [];
  }
};

export default function BlogDetail() {
  const { slug } = useParams();
  const [posts, setPosts] = useState(() => {
    const admin = readAdminBlogs();
    if (admin.length) return admin;
    
    // Filter mockBlogs to exclude deleted items
    const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
    let deletedIds = [];
    try {
      deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    } catch {
      deletedIds = [];
    }
    
    const mapAdminBlogToUser = (b) => ({
      slug: `${slugify(b.title)}-${b.id}`,
      title: b.title,
      published: formatDate(b.publishedDate),
      category: b.category || 'News',
      excerpt: b.description || '',
      author: b.author || '',
      readTime: b.readTime || '',
      imageDataUrl: b.imageDataUrl || b.image || '',
      manualUrl: b.manualUrl || '',
      referenceUrl: b.referenceUrl || '',
      content: (b.content || '')
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p}</p>`) 
        .join(''),
    });
    
    return mockBlogs
      .filter(b => !deletedIds.includes(b.id))
      .map(mapAdminBlogToUser);
  });

  useEffect(() => {
    const refresh = () => {
      const admin = readAdminBlogs();
      if (admin.length) {
        setPosts(admin);
        return;
      }

      // Keep UI current even when only mock fallback is available
      const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
      let deletedIds = [];
      try {
        deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
      } catch {
        deletedIds = [];
      }

      setPosts(
        mockBlogs
          .filter((b) => !deletedIds.includes(b.id))
          .map(mapAdminBlogToUser)
      );
    };
    window.addEventListener('storage', refresh);
    window.addEventListener(BLOGS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(BLOGS_UPDATED_EVENT, refresh);
    };
  }, []);

  const post = useMemo(() => posts.find((x) => x.slug === slug), [posts, slug]);

  if (!post) return <div style={{ padding: 90 }}>Post not found</div>;

  // Get related posts (same category, excluding current)
  const relatedPosts = posts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <img 
                  src={post.imageDataUrl} 
                  alt={post.title} 
                  style={{ 
                    width: '100%',
                    maxWidth: '700px',
                    aspectRatio: '16/9',
                    maxHeight: '380px',
                    objectFit: 'cover',
                    borderRadius: '18px',
                    boxShadow: '0 8px 32px rgba(31,47,74,0.13)',
                    border: '2px solid #e0e7ef',
                    background: '#f8f9fa'
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
                    Access complementary materials that expand on the insights discussed in this article.
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

          {/* Content ที่อัปโหลด (HTML/string) */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author/Share Section */}
          <footer className={styles.footer}>
            <div className={styles.tags}>
              <span className={styles.tagLabel}>Tags:</span>
              <span className={styles.tag}>Dental Implants</span>
              <span className={styles.tag}>{post.category}</span>
              <span className={styles.tag}>Clinical Research</span>
            </div>
            
          </footer>
        </article>

        {/* Related Posts */}
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
                    <h3 className={styles.relatedCardTitle}>
                      {relatedPost.title}
                    </h3>
                    <p className={styles.relatedExcerpt}>
                      {relatedPost.excerpt}
                    </p>
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
