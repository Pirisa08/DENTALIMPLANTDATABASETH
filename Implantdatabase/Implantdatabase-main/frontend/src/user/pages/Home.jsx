import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import useMergedImplants from "../hooks/useMergedImplants";

// คลื่น Parallax Waves แบบสมูท
const ModernWaves = () => (
  <div className={styles.waveContainer}>
    <svg className={styles.waves} viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
      <defs>
        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
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

// ตรรกะดึงแบรนด์ไม่ซ้ำ (จากโค้ดเดิมของคุณ)
const getBrands = (implantsList) => {
  const map = new Map();
  (implantsList || []).forEach((it) => {
    const brand = (it.brand || "").toUpperCase();
    if (!brand) return;
    if (!map.has(brand)) {
      map.set(brand, { brand, company: it.company || brand });
    }
  });
  return Array.from(map.values()).sort((a, b) => a.brand.localeCompare(b.brand));
};

const Home = () => {
  const { implants: mergedImplants, loading } = useMergedImplants();
  const brands = useMemo(() => getBrands(mergedImplants), [mergedImplants]);
  const totalImplants = mergedImplants.length;

  return (
    <div className={styles.homeContainer}>
      
      {/* 1. HERO SECTION (100vh & Full Width) */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.badgeText}>Professional Dental Database</span>
          <h1>Precision Data for <br/><span>Implant Dentistry.</span></h1>
          <p className={styles.heroSubtitle}>
            Access the world's most comprehensive database of dental implant systems, 
            technical specifications, and clinical components in one place.
          </p>
          <Link to="/implants" className={styles.viewAllBtn}>
            Start Exploration
          </Link>
        </div>
        <ModernWaves />
      </section>

      {/* 2. STATS BAR (Fluid Content) */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{brands.length}+</div>
            <div className={styles.statLabel}>Implant Brands</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{totalImplants}+</div>
            <div className={styles.statLabel}>Verified Systems</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>38+</div>
            <div className={styles.statLabel}>Countries</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Free Access</div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE BRANDS (Big Cards, Deep Blue, Aligned Buttons) */}
      <section className={styles.brandSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Explore Brands</h2>
            <p style={{ color: '#718096', marginTop: '10px' }}>
              Comprehensive directory of leading implant manufacturers worldwide.
            </p>
          </div>
          <Link to="/implants" className={styles.viewAllText} style={{ fontSize: '1.2rem', fontWeight: '800', textDecoration: 'none', color: '#3b82f6' }}>
            View All Brands →
          </Link>
        </div>

        <div className={styles.brandGrid}>
          {(loading ? [] : brands).map((b) => {
            const brandLabel = b.brand || "Unlisted";
            const companyLabel = b.company || brandLabel;
            const summary = `Detailed coverage of ${brandLabel} systems and compatible components.`;

            return (
              <Link key={b.brand} to={`/implants/brand/${b.brand}`} className={styles.brandCard}>
                <div className={styles.brandName}>{brandLabel}</div>
                <div className={styles.brandCompany}>{companyLabel}</div>
                <div className={styles.brandSummary}>{summary}</div>
                <div className={styles.brandBtn}>Analyze Models</div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Home;