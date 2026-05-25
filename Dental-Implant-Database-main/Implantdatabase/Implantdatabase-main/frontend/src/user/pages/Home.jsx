import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import { implantsAPI, blogsAPI } from "../../services/api.js";

function ModernWaves() {
  return (
    <div className={styles.waveContainer}>
      <svg
        className={styles.waves}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
          />
        </defs>
        <g className={styles.parallax}>
          <use href="#gentle-wave" x="48" y="0" />
          <use href="#gentle-wave" x="48" y="3" />
          <use href="#gentle-wave" x="48" y="5" />
          <use href="#gentle-wave" x="48" y="7" />
        </g>
      </svg>
    </div>
  );
}

const IMPLANTS_KEY = "admin_implants_v1";
const BLOGS_KEY = "admin_blogs_v1";
const IMPLANTS_UPDATED_EVENT = "implants:updated";
const BLOGS_UPDATED_EVENT = "blogs:updated";

function readLocalItems(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeImplants(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter(Boolean)
    .filter((item) => (item.status || "Active") === "Active")
    .map((item) => ({
      ...item,
      brand:
        item?.brand ||
        item?.brandName ||
        item?.brand_name ||
        item?.brand_title ||
        "",
      company:
        item?.company ||
        item?.companyName ||
        item?.company_name ||
        item?.manufacturer ||
        "",
    }));
}

function normalizeBlogs(items) {
  if (!Array.isArray(items)) return [];

  return items.filter(Boolean).filter((item) => {
    const status = item?.status || item?.blog_status || "Active";
    return status === "Active" || status === "active" || status === "published";
  });
}

function buildBrands(implants = []) {
  const map = new Map();

  implants.forEach((item) => {
    const brand = String(item?.brand || "").trim();
    if (!brand) return;

    if (!map.has(brand)) {
      map.set(brand, {
        brand,
        count: 1,
      });
    } else {
      map.get(brand).count += 1;
    }
  });

  return Array.from(map.values());
}

export default function Home() {
  const [implants, setImplants] = useState(() =>
    normalizeImplants(readLocalItems(IMPLANTS_KEY))
  );

  const [blogs, setBlogs] = useState(() =>
    normalizeBlogs(readLocalItems(BLOGS_KEY))
  );

  const [loading, setLoading] = useState(implants.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadImplants = async () => {
      try {
        setLoading(true);
        setError("");

        const apiData = await implantsAPI.getAll();
        const normalized = normalizeImplants(apiData);

        if (!isMounted) return;

        if (normalized.length > 0) {
          setImplants(normalized);

          try {
            localStorage.setItem(IMPLANTS_KEY, JSON.stringify(apiData));
          } catch {
            // ignore localStorage write errors
          }
        } else {
          setImplants(normalizeImplants(readLocalItems(IMPLANTS_KEY)));
        }
      } catch (err) {
        console.error("Failed to load implants on home page:", err);
        if (!isMounted) return;

        setImplants(normalizeImplants(readLocalItems(IMPLANTS_KEY)));
        setError("Unable to load implant data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadBlogs = async () => {
      try {
        const apiData = await blogsAPI.getAll();
        const normalized = normalizeBlogs(apiData);

        if (!isMounted) return;

        setBlogs(normalized);

        try {
          localStorage.setItem(BLOGS_KEY, JSON.stringify(apiData));
        } catch {
          // ignore localStorage write errors
        }
      } catch (err) {
        console.error("Failed to load blogs on home page:", err);
        if (!isMounted) return;

        setBlogs(normalizeBlogs(readLocalItems(BLOGS_KEY)));
      }
    };

    loadImplants();
    loadBlogs();

    const refreshImplantsLocal = () => {
      setImplants(normalizeImplants(readLocalItems(IMPLANTS_KEY)));
    };

    const refreshBlogsLocal = () => {
      setBlogs(normalizeBlogs(readLocalItems(BLOGS_KEY)));
    };

    window.addEventListener("storage", refreshImplantsLocal);
    window.addEventListener("storage", refreshBlogsLocal);
    window.addEventListener(IMPLANTS_UPDATED_EVENT, refreshImplantsLocal);
    window.addEventListener(BLOGS_UPDATED_EVENT, refreshBlogsLocal);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", refreshImplantsLocal);
      window.removeEventListener("storage", refreshBlogsLocal);
      window.removeEventListener(IMPLANTS_UPDATED_EVENT, refreshImplantsLocal);
      window.removeEventListener(BLOGS_UPDATED_EVENT, refreshBlogsLocal);
    };
  }, []);

  const brandsData = useMemo(() => buildBrands(implants), [implants]);
  const totalImplants = implants.length;
  const totalBrands = brandsData.length;
  const totalBlogs = blogs.length;

  const topBrands = useMemo(() => {
    return [...brandsData]
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand))
      .slice(0, 12);
  }, [brandsData]);

  const implantFeatures = [
    {
      title: "Implant Identification",
      text: "Browse implant systems by brand and access structured product information.",
    },
    {
      title: "Organized Database",
      text: "A clean implant database designed for fast searching and simple review.",
    },
    {
      title: "Brand Exploration",
      text: "Quickly explore available implant brands from one minimal interface.",
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.badgeText}>Dental Implant Database MFU</span>

          <h1>
            Identify and Explore <br />
            <span>Dental Implant Systems.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            A clean implant database for browsing dental implant brands,
            reviewing system information, and finding structured product records
            with a simple professional interface.
          </p>

          <div className={styles.heroActions}>
            <Link to="/implants" className={styles.viewAllBtn}>
              Explore Implant Database
            </Link>
          </div>
        </div>

        <ModernWaves />
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{totalBrands}+</div>
            <div className={styles.statLabel}>Implant Brands</div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statNumber}>{totalImplants}+</div>
            <div className={styles.statLabel}>Implant Systems</div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statNumber}>{totalBlogs}+</div>
            <div className={styles.statLabel}>Blog Articles</div>
          </div>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.introGrid}>
          <div className={styles.introContent}>
            <span className={styles.smallLabel}>Implant Data Platform</span>
            <h2>Search implant information with clarity.</h2>
            <p>
              This platform helps users browse dental implant systems through a
              simple database structure. Implant records are organized by brand
              to make product exploration easier, cleaner, and more efficient.
            </p>
          </div>

          <div className={styles.introCard}>
            <div className={styles.cardIcon}>AI</div>
            <h3>Implant Database</h3>
            <p>
              Built for implant brand discovery, system review, and structured
              dental implant data presentation.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.sectionCenter}>
          <span className={styles.smallLabel}>Core Features</span>
          <h2>Focused on implant brands and systems.</h2>
          <p>
            A minimal website experience for browsing implant brands, comparing
            available systems, and reviewing important implant records.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {implantFeatures.map((item) => (
            <div className={styles.featureCard} key={item.title}>
              <div className={styles.featureIcon}>✦</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.brandSection}>
        <div className={styles.brandPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.smallLabel}>Explore Brands</span>
              <h2>Dental implant brands</h2>

              {loading && <p>Loading implant brands...</p>}
              {!loading && error && <p>{error}</p>}
              {!loading && !error && (
                <p>
                  Select an implant brand to browse related systems in the
                  database.
                </p>
              )}
            </div>

            <Link to="/implants" className={styles.viewAllText}>
              View All 
            </Link>
          </div>

          <div className={styles.brandShowcase}>
            {topBrands.map((brandItem) => (
              <Link
                key={brandItem.brand}
                to={`/implants?brand=${encodeURIComponent(brandItem.brand)}`}
                className={styles.brandShowcaseCard}
              >
                <span>{brandItem.brand}</span>
              </Link>
            ))}

            {!loading && topBrands.length === 0 && (
              <div className={styles.emptyState}>No brands available</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}