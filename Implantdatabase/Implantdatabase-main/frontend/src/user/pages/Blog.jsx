import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Blog.module.css';
import { mockBlogs } from '../../admin/data/implantsMockData';
import Breadcrumb from '../components/Breadcrumb';

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

function mapAdminBlogToUser(blog) {
    const safeContent = typeof blog.content === 'string' ? blog.content : '';
    return {
        slug: `${slugify(blog.title)}-${blog.id}`,
        title: blog.title,
        published: formatDate(blog.publishedDate),
        category: blog.category || 'News',
        excerpt: blog.description || '',
        author: blog.author || '',
        readTime: blog.readTime || '',
        imageDataUrl: blog.imageDataUrl || blog.image || '',
        manualUrl: blog.manualUrl || '',
        referenceUrl: blog.referenceUrl || '',
        content: safeContent
            .split('\n')
            .map((paragraph) => paragraph.trim())
            .filter((paragraph) => paragraph.length > 0)
            .map((paragraph) => `<p>${paragraph}</p>`)
            .join(''),
    };
}

function readAdminBlogs() {
    try {
        const raw = localStorage.getItem(BLOG_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        let deletedIds = [];
        const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
        if (deletedIdsRaw) {
            try {
                const maybeIds = JSON.parse(deletedIdsRaw);
                deletedIds = Array.isArray(maybeIds) ? maybeIds : [];
            } catch (err) {
                console.error('Unable to parse deleted blog ids', err);
                deletedIds = [];
            }
        }

        return parsed
            .filter((entry) => (entry.status || 'Active') === 'Active')
            .filter((entry) => !deletedIds.includes(entry.id))
            .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
            .map((entry) => mapAdminBlogToUser(entry));
    } catch (err) {
        console.error('Unable to read admin blogs', err);
        return [];
    }
}

function Blog() {
    const [posts, setPosts] = useState(() => {
        const adminBlogs = readAdminBlogs();
        if (adminBlogs.length > 0) {
            return adminBlogs;
        }

        let deletedIds = [];
        const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
        if (deletedIdsRaw) {
            try {
                const maybeIds = JSON.parse(deletedIdsRaw);
                deletedIds = Array.isArray(maybeIds) ? maybeIds : [];
            } catch (err) {
                console.error('Unable to parse deleted blog ids', err);
                deletedIds = [];
            }
        }

        return mockBlogs
            .filter((blog) => !deletedIds.includes(blog.id))
            .map((blog) => mapAdminBlogToUser(blog));
    });

    useEffect(() => {
        function refreshLocal() {
            const adminBlogs = readAdminBlogs();
            if (adminBlogs.length > 0) {
                setPosts(adminBlogs);
                return;
            }

            let deletedIds = [];
            const deletedIdsRaw = localStorage.getItem(DELETED_BLOGS_KEY);
            if (deletedIdsRaw) {
                try {
                    const maybeIds = JSON.parse(deletedIdsRaw);
                    deletedIds = Array.isArray(maybeIds) ? maybeIds : [];
                } catch (err) {
                    console.error('Unable to parse deleted blog ids', err);
                    deletedIds = [];
                }
            }

            setPosts(
                mockBlogs
                    .filter((blog) => !deletedIds.includes(blog.id))
                    .map((blog) => mapAdminBlogToUser(blog))
            );
        }

        window.addEventListener('storage', refreshLocal);
        window.addEventListener(BLOGS_UPDATED_EVENT, refreshLocal);

        return () => {
            window.removeEventListener('storage', refreshLocal);
            window.removeEventListener(BLOGS_UPDATED_EVENT, refreshLocal);
        };
    }, []);

    const mainPost = useMemo(() => (posts.length > 0 ? posts[0] : null), [posts]);
    const latestPosts = useMemo(() => (posts.length > 1 ? posts.slice(1) : []), [posts]);

    const heroCategory = mainPost && mainPost.category ? mainPost.category : 'Event news';
    const heroPublished = mainPost && mainPost.published ? mainPost.published : 'December 15, 2025';
    const heroTitle = mainPost && mainPost.title ? mainPost.title : 'Stay informed with the latest implant insights';
    const heroExcerpt = mainPost && mainPost.excerpt ? mainPost.excerpt : 'Explore updates, clinical perspectives, and event highlights from across the implant dentistry community.';

    return (
        <div className={styles.page}>
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: "Blog" }
                ]}
            />
            <div className={styles.pageContainer}>
                <section className={styles.heroSection}>
                <div className={styles.heroImageWrapper}>
                    {mainPost && mainPost.imageDataUrl ? (
                        // คลิกรูปปกไป blog detail เสมอ
                        <Link to={`/blog/${mainPost.slug}`} className={styles.heroImageLink}>
                            <img src={mainPost.imageDataUrl} alt={heroTitle} className={styles.heroImage} />
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
                                <path d="M 90 260 Q 240 190 390 260" stroke="rgba(255,255,255,0.22)" strokeWidth="6" fill="none" strokeLinecap="round" />
                                <text x="240" y="302" fontFamily="'Segoe UI', sans-serif" fontSize="40" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontWeight="600">🦷</text>
                            </svg>
                        </div>
                    )}
                </div>
                <div className={styles.heroContent}>
                    <span className={styles.heroEyebrow}>{heroCategory}</span>
                    {/* Reference indicators for main post - clickable */}
                    {mainPost && (mainPost.manualUrl || mainPost.referenceUrl) && (
                        <div className={styles.heroReferenceBadges}>
                            {mainPost.manualUrl && (
                                <a 
                                    href={mainPost.manualUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={styles.heroReferenceBadge} 
                                    title="Click to open manual/documentation link"
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
                                    title="Click to open reference source link"
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
                        // ปุ่ม Read more จะพา่ไป blog detail เสมอ
                        <Link to={`/blog/${mainPost.slug}`} className={styles.heroLink}>
                            <span>Read more</span>
                            <span aria-hidden="true" className={styles.heroLinkIcon}>→</span>
                        </Link>
                    ) : null}
                </div>
            </section>

            <section className={styles.sectionIntro}>
                <h2 className={styles.sectionHeading}>Latest newsroom highlights</h2>
                <p className={styles.sectionCopy}>
                    Discover corporate announcements, educational spotlights, and event coverage curated for implant professionals and partners.
                </p>
            </section>

            <section className={styles.latestSection}>
                <div className={styles.latestGrid}>
                    {latestPosts.map((post) => {
                        const cardDate = post.published ? post.published : 'Date to be announced';
                        const cardCategory = post.category ? post.category : 'News';

                        return (
                            <article key={post.slug} className={styles.latestCard}>
                                <Link to={`/blog/${post.slug}`} className={styles.cardInner}>
                                    <div className={styles.cardImageWrapper}>
                                        {post.imageDataUrl ? (
                                            <img src={post.imageDataUrl} alt={post.title} className={styles.cardImage} />
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
                                                    <path d="M 80 170 Q 170 140 260 170" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                                                    <text x="170" y="196" fontFamily="'Segoe UI', sans-serif" fontSize="28" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontWeight="600">🦷</text>
                                                </svg>
                                            </div>
                                        )}
                                        <span className={styles.cardCategory}>{cardCategory}</span>
                                        {/* Reference Links Indicators - clickable */}
                                        {(post.manualUrl || post.referenceUrl) && (
                                            <div className={styles.cardReferenceBadges}>
                                                {post.manualUrl && (
                                                    <a 
                                                        href={post.manualUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className={styles.cardReferenceBadge} 
                                                        title="Click to open manual/documentation link"
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
                                                        title="Click to open reference source link"
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
                                            <span aria-hidden="true" className={styles.cardLinkIcon}>→</span>
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            </section>
            </div>
        </div>
    );
}

export default Blog;