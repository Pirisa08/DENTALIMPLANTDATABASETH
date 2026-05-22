// ImplantDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import ImplantCard from "../components/ImplantCard";
import styles from "./ImplantDetail.module.css";
import useMergedImplants, {
  pickImplantImages,
} from "../hooks/useMergedImplants";

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
  const [showOverlay, setShowOverlay] = useState(false);

  const displayImplant = useMemo(() => {
    return (
      (mergedImplants || []).find(
        (item) => (item.slug || "").toLowerCase() === slugKey
      ) || null
    );
  }, [mergedImplants, slugKey]);

  const implantImages = useMemo(() => {
    if (!displayImplant) return [];
    return pickImplantImages(displayImplant).filter((img) => img.dataUrl);
  }, [displayImplant]);

  useEffect(() => {
    setSelectedImage(0);
  }, [displayImplant?.slug, displayImplant?.id]);

  const safeSelectedImage =
    implantImages[selectedImage] || implantImages[0] || null;

  // Get image message fields from displayImplant
  const imageMessages = [
    displayImplant?.image1Message || displayImplant?.image1_message || "",
    displayImplant?.image2Message || displayImplant?.image2_message || "",
    displayImplant?.image3Message || displayImplant?.image3_message || "",
  ];

  const brandName =
    (displayImplant?.brand && String(displayImplant.brand)) ||
    toDisplayText(displayImplant?.company) ||
    "Implant";

  const companyName = toDisplayText(displayImplant?.company) || "-";

  const otherImplants = useMemo(() => {
    if (!displayImplant) return [];

    const targetBrand = String(displayImplant.brand || "").toUpperCase();
    if (!targetBrand) return [];

    return (mergedImplants || []).filter((item) => {
      if (!item) return false;
      if (String(item.status || "").toLowerCase() !== "active") return false;

      const sameSlug = (item.slug || "").toLowerCase() === slugKey;
      const sameBrand = String(item.brand || "").toUpperCase() === targetBrand;

      return !sameSlug && sameBrand;
    });
  }, [displayImplant, mergedImplants, slugKey]);

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

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Implants", to: "/implants" },
          {
            label: brandName,
            to: `/implants/brand/${encodeURIComponent(
              displayImplant.brand || ""
            )}`,
          },
          { label: displayImplant.name || "Implant Detail" },
        ]}
      />

      <section className={styles.top}>
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            <div
              className={styles.mainImage}
              style={{ position: "relative", cursor: safeSelectedImage ? "pointer" : "default" }}
              onClick={() => safeSelectedImage && setShowOverlay(true)}
              title={imageMessages[selectedImage] || undefined}
            >
              {safeSelectedImage?.dataUrl ? (
                <img
                  src={safeSelectedImage.dataUrl}
                  alt={displayImplant.name}
                  className={styles.actualImage}
                />
              ) : (
                <span className={styles.imageLabel}>{displayImplant.name}</span>
              )}
              {/* Overlay trigger icon */}
              {safeSelectedImage && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 16,
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "2px 10px",
                    fontSize: 13,
                    pointerEvents: "none",
                  }}
                >
                  Info
                </span>
              )}
            </div>
            {/* Overlay for image message */}
            {showOverlay && (
              <div
                className={styles.imageOverlayBg}
                onClick={() => setShowOverlay(false)}
              >
                <div
                  className={styles.imageOverlayBox}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className={styles.imageOverlayClose}
                    onClick={() => setShowOverlay(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <div className={styles.imageOverlayTitle}>
                    Image Information
                  </div>
                  <div className={styles.imageOverlayMsg}>
                    <span className={styles.imageOverlayMsgLabel}>Current message:</span>
                    <br />
                    {imageMessages[selectedImage] ? (
                      <span className={styles.imageOverlayMsgText}>{imageMessages[selectedImage]}</span>
                    ) : (
                      <span className={styles.imageOverlayMsgEmpty}>(No message provided)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {implantImages.length > 0 && (
            <div className={styles.thumbnails}>
              {implantImages.map((img, index) => (
                <button
                  key={img.id || index}
                  type="button"
                  className={`${styles.thumbnail} ${
                    selectedImage === index ? styles.thumbnailActive : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img.dataUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoBox}>
            <div className={styles.infoHeader}>
              <span className={styles.infoEyebrow}>Model Insight</span>
              <h1 className={styles.infoTitle}>{displayImplant.name}</h1>
              <p className={styles.infoSubtitle}>
                Detailed specifications sourced from manufacturer documentation
                and curated submissions.
              </p>
            </div>

            <div className={styles.infoContent}>
              <Info label="Brand" value={displayImplant.brand} />
              <Info label="Company" value={companyName} />
              <Info label="Website" value={displayImplant.website} />
              <Info label="Level" value={toDisplayText(displayImplant.level)} />
              <Info
                label="Connection Type"
                value={toDisplayText(displayImplant.connectionType)}
              />
              <Info
                label="Connection Shape"
                value={toDisplayText(displayImplant.connectionShape)}
              />
              <Info
                label="Screwdriver Shape"
                value={toDisplayText(displayImplant.screwdriverShape)}
              />
              <Info
                label="Head Shape"
                value={toDisplayText(displayImplant.headShape)}
              />
              <Info
                label="Body Shape"
                value={toDisplayText(displayImplant.bodyShape)}
              />
              <Info
                label="Apex Shape"
                value={toDisplayText(displayImplant.apexShape)}
              />
              <Info
                label="Country"
                value={toDisplayText(
                  displayImplant.country || displayImplant.countryText
                )}
              />
              <Info
                label="Official Distributor"
                value={toDisplayText(displayImplant.officialDistributor)}
              />
              <Info
                label="Brand Description"
                value={toDisplayText(displayImplant.brandDescription)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <div>
            <span className={styles.relatedEyebrow}>Related Catalogue</span>
            <h2 className={styles.relatedTitle}>Related Implants</h2>
          </div>

          <Link
            to={`/implants/brand/${encodeURIComponent(displayImplant.brand || "")}`}
            className={styles.viewAll}
          >
            View All
          </Link>
        </div>

        {otherImplants.length === 0 ? (
          <div className={styles.emptyState}>No related implants found.</div>
        ) : (
          <div className={styles.relatedGrid}>
            {otherImplants.slice(0, 4).map((item) => (
              <ImplantCard
                key={item.slug || item.id}
                title={item.name}
                company={item.company || item.brand}
                slug={item.slug}
                image={
                  pickImplantImages(item).find((img) => img.dataUrl)?.dataUrl || ""
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoColon}>:</div>
      <div className={styles.infoValue}>{renderInfoValue(value)}</div>
    </div>
  );
}

function renderInfoValue(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return <span>-</span>;
  }

  if (typeof raw !== "string") {
    if (Array.isArray(raw)) {
      const items = raw.filter(Boolean);
      return items.length ? <span>{items.join(", ")}</span> : <span>-</span>;
    }
    if (typeof raw === "object") {
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