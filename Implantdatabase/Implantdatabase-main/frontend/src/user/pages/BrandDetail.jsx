import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import ImplantCard from "../components/ImplantCard";
import styles from "./BrandDetail.module.css";
import useMergedImplants, { pickImplantImages } from "../hooks/useMergedImplants";

/* ดึง brand ไม่ซ้ำ จากรายการ implants ที่ส่งมา */
const getBrands = (implantsList) => {
  if (!Array.isArray(implantsList)) return [];
  const map = new Map();

  implantsList.forEach((it) => {
    const brand = (it.brand || "").toUpperCase();
    if (!brand) return;

    if (!map.has(brand)) {
      map.set(brand, {
        brand,
        company: it.company || brand,
        count: 0,
        country: it.country || "—",
        website: it.website || "#",
        description: it.brandDescription || "",
      });
    }
    map.get(brand).count += 1;
  });

  return Array.from(map.values());
};

export default function BrandDetail() {
  const { brand } = useParams();
  const normalizedBrandName = (brand || "").toUpperCase();
  const { implants: mergedImplants, loading } = useMergedImplants();

  const filtered = useMemo(() => {
    return (mergedImplants || []).filter(
      (item) => (item.brand || "").toUpperCase() === normalizedBrandName
    );
  }, [mergedImplants, normalizedBrandName]);

  const [brandModelCount, setBrandModelCount] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_masterdata_v1");
      if (raw) {
        const masterData = JSON.parse(raw);
        const brandData = masterData.brand?.find(
          (b) => b.name.toUpperCase() === normalizedBrandName
        );
        if (brandData && brandData.modelCount) {
          setBrandModelCount(brandData.modelCount);
        }
      }
    } catch (err) {
      console.error("Error loading brand model count:", err);
    }
  }, [normalizedBrandName]);

  useEffect(() => {
    const handler = (e) => {
      if (!e || !e.key || e.key === "admin_masterdata_v1") {
        try {
          const raw = localStorage.getItem("admin_masterdata_v1");
          if (raw) {
            const masterData = JSON.parse(raw);
            const brandData = masterData.brand?.find(
              (b) => b.name.toUpperCase() === normalizedBrandName
            );
            if (brandData && brandData.modelCount) {
              setBrandModelCount(brandData.modelCount);
            }
          }
        } catch (err) {
          console.error("Error loading brand model count from storage event:", err);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [normalizedBrandName]);

  const brandData = useMemo(() => {
    return getBrands(mergedImplants).find(
      (b) => b.brand === normalizedBrandName
    ) || null;
  }, [mergedImplants, normalizedBrandName]);
  const brandCompanyName =
    brandData &&
    brandData.company &&
    brandData.company.toUpperCase() !== normalizedBrandName
      ? brandData.company
      : "";
  const brandWebsiteUrl =
    brandData && brandData.website && brandData.website !== "#"
      ? brandData.website
      : "";
  const websiteHostname = brandWebsiteUrl
    ? brandWebsiteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "")
    : "";
  const primaryCountryValue =
    brandData && brandData.country && brandData.country !== "—"
      ? brandData.country
      : "—";
  const availableModels = brandModelCount > 0 ? brandModelCount : filtered.length;

  const parseCountryDetails = (value) => {
    const raw = (value || "").trim();
    if (!raw) return [];
    const segments = raw.split("/").map((segment) => segment.trim()).filter(Boolean);
    if (segments.length === 0) return [];
    return segments
      .map((segment) => {
        const [label, ...rest] = segment.split(":");
        const text = rest.join(":").trim();
        if (!text) {
          return {
            label: "",
            text: segment.trim(),
          };
        }
        return {
          label: label.trim(),
          text,
        };
      })
      .filter((detail) => detail.text);
  };

  const countryDetails =
    primaryCountryValue !== "—" ? parseCountryDetails(primaryCountryValue) : [];
  const hasCountryDetails = countryDetails.length > 0;

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Implants", to: "/implants" },
          { label: normalizedBrandName },
        ]}
      />

      <div className={styles.brandDetailContainer}>
        <div className={styles.brandHeader}>
          <div className={styles.brandLogoBox}>
            <div className={styles.brandLogoPlaceholder}>
              <span>{normalizedBrandName}</span>
            </div>
          </div>

          <div className={styles.brandInfo}>
            <div>
              <h1 className={styles.brandTitle}>
                {normalizedBrandName}
                <sup>®</sup>
              </h1>
              {brandCompanyName && (
                <p className={styles.brandCompany}>Operated by {brandCompanyName}</p>
              )}
            </div>

            {brandWebsiteUrl && (
              <a
                href={brandWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.brandWebsite}
              >
                <span className={styles.brandWebsiteLabel}>Official Website</span>
                <span className={styles.brandWebsiteHost}>{websiteHostname}</span>
              </a>
            )}

            <div className={styles.brandMeta}>
              <div className={styles.brandMetaCard}>
                <span className={styles.brandMetaLabel}>Primary Country</span>
                <div className={styles.brandMetaValue}>
                  {hasCountryDetails ? (
                    <div className={styles.brandMetaDetails}>
                      {countryDetails.map((detail, index) => (
                        <div
                          key={`${detail.label}-${index}`}
                          className={styles.brandMetaDetail}
                        >
                          {detail.label && (
                            <span className={styles.brandMetaDetailLabel}>{detail.label}</span>
                          )}
                          <span className={styles.brandMetaDetailText}>{detail.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.brandMetaText}>{primaryCountryValue}</span>
                  )}
                </div>
              </div>
              <div className={styles.brandMetaCard}>
                <span className={styles.brandMetaLabel}>Available Models</span>
                <div className={styles.brandMetaValue}>
                  <span className={styles.brandMetaText}>
                    {availableModels > 0 ? availableModels.toLocaleString() : "—"}
                  </span>
                </div>
              </div>
              <div className={styles.brandMetaCard}>
                <span className={styles.brandMetaLabel}>Implant References</span>
                <div className={styles.brandMetaValue}>
                  <span className={styles.brandMetaText}>
                    {filtered.length > 0 ? filtered.length.toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            {brandData?.description && (
              <p className={styles.brandDescription}>{brandData.description}</p>
            )}
          </div>
        </div>

        <div className={styles.tabContent}>
          <h2 className={styles.sectionTitle}>Implants</h2>
          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading implants…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No implants are catalogued for this brand yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((it) => {
                const primaryImage = pickImplantImages(it).find((img) => img.dataUrl)?.dataUrl || "";
                const companyValue = it.company || it.brand;
                return (
                  <ImplantCard
                    key={it.slug}
                    title={it.name}
                    company={companyValue}
                    slug={it.slug}
                    image={primaryImage}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
