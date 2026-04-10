import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import ImplantCard from "../components/ImplantCard";
import styles from "./ImplantDetail.module.css";
import useMergedImplants, { pickImplantImages } from "../hooks/useMergedImplants";

const toDisplayText = (value) => {
  if (value === 0) return "0";
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.label) return value.label;
    if (value.description) return value.description;
  }
  return String(value);
};

export default function ImplantDetail() {
  const { slug } = useParams();
  const slugKey = (slug || "").toLowerCase();
  const { implants: mergedImplants, loading } = useMergedImplants();
  const [selectedImage, setSelectedImage] = useState(0);

  const displayImplant = useMemo(() => {
    return (mergedImplants || []).find(
      (item) => (item.slug || "").toLowerCase() === slugKey
    ) || null;
  }, [mergedImplants, slugKey]);

  useEffect(() => {
    setSelectedImage(0);
  }, [displayImplant?.slug, displayImplant?.id]);

  if (!displayImplant && loading) {
    return (
      <div style={{ padding: 90 }}>
        <h2>Loading…</h2>
      </div>
    );
  }

  if (!displayImplant) {
    return (
      <div style={{ padding: 90 }}>
        <h2>Implant not found</h2>
        <Link to="/implants">Back</Link>
      </div>
    );
  }

  const implantImages = useMemo(() => pickImplantImages(displayImplant), [displayImplant]);

  const brandName =
    (displayImplant.brand && String(displayImplant.brand)) ||
    toDisplayText(displayImplant.company) ||
    "Implant";
  const companyName = toDisplayText(displayImplant.company) || "-";

  const otherImplants = useMemo(() => {
    const targetBrand = (displayImplant.brand || "").toUpperCase();
    if (!targetBrand) return [];
    return (mergedImplants || []).filter((item) => {
      if (!item) return false;
      const sameSlug = (item.slug || "").toLowerCase() === slugKey;
      const sameBrand = (item.brand || "").toUpperCase() === targetBrand;
      return !sameSlug && sameBrand;
    });
  }, [displayImplant, mergedImplants, slugKey]);

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Implants", to: "/implants" },
          { label: brandName, to: `/implants/brand/${displayImplant.brand}` },
          { label: displayImplant.name || "Implant Detail" },
        ]}
      />

      <section className={styles.top}>
        {/* Left: Images */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            <div className={styles.mainImage}>
              {implantImages[selectedImage]?.dataUrl ? (
                <img 
                  src={implantImages[selectedImage].dataUrl} 
                  alt={displayImplant.name}
                  className={styles.actualImage}
                />
              ) : (
                <span className={styles.imageLabel}>{displayImplant.name}</span>
              )}
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className={styles.thumbnails}>
            {implantImages.map((img, index) => (
              <button
                key={img.id}
                className={`${styles.thumbnail} ${selectedImage === index ? styles.thumbnailActive : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                {img.dataUrl ? (
                  <img src={img.dataUrl} alt={`Thumbnail ${index + 1}`} className={styles.thumbnailImage} />
                ) : (
                  <span className={styles.thumbnailNumber}>{index + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Information Box (Folder Style) */}
        <div className={styles.infoSection}>
          <div className={styles.infoBox}>
            <div className={styles.infoHeader}>
              <span className={styles.infoEyebrow}>Model Insight</span>
              <h1 className={styles.infoTitle}>{displayImplant.name}</h1>
              <p className={styles.infoSubtitle}>
                Detailed specifications sourced from manufacturer documentation and curated submissions.
              </p>
            </div>

            <div className={styles.infoContent}>
              <Info label="Company" value={companyName} />
              <Info label="Level" value={toDisplayText(displayImplant.level)} />
              <Info label="Connection Type" value={toDisplayText(displayImplant.connectionType)} />
              <Info label="Connection Shape" value={toDisplayText(displayImplant.connectionShape)} />
              <Info label="Screwdriver Shape" value={toDisplayText(displayImplant.screwdriverShape)} />
              <Info label="Head Shape" value={toDisplayText(displayImplant.headShape)} />
              <Info label="Body Shape" value={toDisplayText(displayImplant.bodyShape)} />
              <Info label="Apex Shape" value={toDisplayText(displayImplant.apexShape)} />
              <Info label="Country" value={toDisplayText(displayImplant.country || displayImplant.countryText)} />
              <Info label="Official Distributor" value={toDisplayText(displayImplant.officialDistributor)} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.other}>
        <div className={styles.otherHeader}>
          <div>
            <span className={styles.otherEyebrow}>Related Catalogue</span>
            <h2 className={styles.otherTitle}>More from {brandName}</h2>
          </div>
          <Link to={`/implants/brand/${displayImplant.brand}`} className={styles.viewAll}>
            View brand
          </Link>
        </div>

        <div className={styles.grid}>
          {otherImplants.map((it) => {
            const previewImage = pickImplantImages(it).find((img) => img.dataUrl)?.dataUrl || "";
            const company = toDisplayText(it.company) || it.brand;
            return (
              <ImplantCard key={it.slug || it.id} title={it.name} company={company} slug={it.slug} image={previewImage} />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoColon}>:</span>
      <div className={styles.infoValue}>{formatInfoValue(value)}</div>
    </div>
  );
}

function formatInfoValue(raw) {
  if (raw === 0) return <span>0</span>;
  if (!raw) return <span>-</span>;
  if (typeof raw !== "string") {
    if (typeof raw === "object" && raw !== null) {
      if (raw.name) return <span>{raw.name}</span>;
      if (raw.title) return <span>{raw.title}</span>;
      if (raw.label) return <span>{raw.label}</span>;
      return <span>{JSON.stringify(raw)}</span>;
    }
    return <span>{String(raw)}</span>;
  }

  const trimmed = raw.trim();
  if (!trimmed) return <span>-</span>;

  const normalized = trimmed
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ");

  const segments = normalized.split("•").map((part) => part.trim());
  const lead = segments.shift();
  const bullets = segments
    .map((part) => part.replace(/^[-•]+/, "").trim())
    .filter(Boolean);

  return (
    <>
      {lead && <span>{lead}</span>}
      {bullets.length > 0 && (
        <ul className={styles.infoValueList}>
          {bullets.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      )}
      {!lead && bullets.length === 0 && <span>-</span>}
    </>
  );
}
