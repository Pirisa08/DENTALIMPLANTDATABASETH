import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import { implantsAPI } from "../../services/api.js";

/* ===== Modern Waves ===== */
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
const IMPLANTS_UPDATED_EVENT = "implants:updated";

function readLocalImplants() {
  try {
    const raw = localStorage.getItem(IMPLANTS_KEY);
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

function buildBrands(implants = []) {
  const map = new Map();

  implants.forEach((item) => {
    const brand = String(item?.brand || "").trim();
    if (!brand) return;

    const company = String(item?.company || "Unknown Company").trim() || "Unknown Company";

    if (!map.has(brand)) {
      map.set(brand, {
        brand,
        company,
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
    normalizeImplants(readLocalImplants())
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
          setImplants(normalizeImplants(readLocalImplants()));
        }
      } catch (err) {
        console.error("Failed to load implants on home page:", err);
        if (!isMounted) return;
        setImplants(normalizeImplants(readLocalImplants()));
        setError("Unable to load implant data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadImplants();

    const refreshLocal = () => {
      setImplants(normalizeImplants(readLocalImplants()));
    };

    window.addEventListener("storage", refreshLocal);
    window.addEventListener(IMPLANTS_UPDATED_EVENT, refreshLocal);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", refreshLocal);
      window.removeEventListener(IMPLANTS_UPDATED_EVENT, refreshLocal);
    };
  }, []);

  const brandsData = useMemo(() => buildBrands(implants), [implants]);
  const totalImplants = implants.length;
  const totalBrands = brandsData.length;

  const topBrands = useMemo(() => {
    return [...brandsData]
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand))
      .slice(0, 5);
  }, [brandsData]);

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.badgeText}>Professional Dental Database</span>

          <h1>
            Precision Data for <br />
            <span>Implant Dentistry.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Access implant systems, compare brands, and explore structured clinical
            information in one connected platform.
          </p>

          <Link to="/implants" className={styles.viewAllBtn}>
            Start Exploration
          </Link>
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
            <div className={styles.statLabel}>Verified Systems</div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Structured Data</div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statNumber}>Live</div>
            <div className={styles.statLabel}>Database Ready</div>
          </div>
        </div>
      </section>

      <section className={styles.brandSection}>
        <div className={styles.brandPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Explore Brands</h2>

              {loading && <p>Loading implant brands...</p>}
              {!loading && error && <p>{error}</p>}
              {!loading && !error && (
                <p>
                  Browse leading implant brands and explore available systems in the
                  database.
                </p>
              )}
            </div>

            <Link to="/implants" className={styles.viewAllText}>
              View All Brands →
            </Link>
          </div>

          <div className={styles.brandGrid}>
            {topBrands.map((brandItem) => (
              <Link
                key={brandItem.brand}
                to={`/implants?brand=${encodeURIComponent(brandItem.brand)}`}
                className={styles.brandCard}
              >
                <div className={styles.brandName}>{brandItem.brand}</div>
                <div className={styles.brandCompany}>{brandItem.company}</div>
                <div className={styles.brandSummary}>
                  {brandItem.count} implant systems available in the database
                </div>
                <div className={styles.brandBtn}>Explore</div>
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