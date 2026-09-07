import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import useMergedImplants from "../hooks/useMergedImplants";

const ModernWaves = () => (
  <div className={styles.waveContainer}>
    <svg
      className={styles.waves}
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
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

const buildBrands = (implants) => {
  const map = new Map();

  implants.forEach((it) => {
    const brandRaw =
      it.brand ||
      it.company?.name ||
      it.company ||
      "UNKNOWN";

    const brand = String(brandRaw).trim().toUpperCase();

    if (!map.has(brand)) {
      map.set(brand, {
        brand,
        company:
          it.company?.name ||
          (typeof it.company === "string" ? it.company : "") ||
          brand,
        count: 0,
      });
    }

    map.get(brand).count++;
  });

  return Array.from(map.values());
};

export default function Home() {
  const { implants, loading, error } = useMergedImplants();

  // 🔥 จำนวนทั้งหมดจริง
  const totalImplants = implants.length;

  const brandsData = useMemo(() => buildBrands(implants), [implants]);

  // 🔥 จำนวน brand จริงทั้งหมด
  const totalBrands = brandsData.length;

  // 🔥 เอาแค่ 5 ตัว (Top)
  const topBrands = useMemo(() => {
    return [...brandsData]
      .sort((a, b) => b.count - a.count) // เรียงจากเยอะสุด
      .slice(0, 5); // 🔥 เอาแค่ 5 ตัว
  }, [brandsData]);

  return (
    <div className={styles.homeContainer}>
      {/* HERO */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.badgeText}>
            Professional Dental Database
          </span>
          <h1>
            Precision Data for <br />
            <span>Implant Dentistry.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Access the world's most comprehensive database of dental implant systems.
          </p>
          <Link to="/implants" className={styles.viewAllBtn}>
            Start Exploration
          </Link>
        </div>
        <ModernWaves />
      </section>

      {/* STATS */}
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
            <div className={styles.statLabel}>Real Data</div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statNumber}>API</div>
            <div className={styles.statLabel}>Connected</div>
          </div>
        </div>
      </section>

      {/* EXPLORE BRANDS */}
      <section className={styles.brandSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Explore Brands</h2>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>

          <Link to="/implants" className={styles.viewAllText}>
            View All Brands →
          </Link>
        </div>

        <div className={styles.brandGrid}>
          {topBrands.map((b) => (
            <Link
              key={b.brand}
              to={`/implants/brand/${encodeURIComponent(b.brand)}`}
              className={styles.brandCard}
            >
              <div className={styles.brandName}>{b.brand}</div>
              <div className={styles.brandCompany}>{b.company}</div>

              {/* 🔥 แสดงจำนวน */}
              <div className={styles.brandSummary}>
                {b.count} implants available
              </div>

              <div className={styles.brandBtn}>Analyze Models</div>
            </Link>
          ))}

          {!loading && topBrands.length === 0 && (
            <div>No brands available</div>
          )}
        </div>
      </section>
    </div>
  );
}