// BrandDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import ImplantCard from "../components/ImplantCard";
import styles from "./BrandDetail.module.css";
import useMergedImplants, {
  pickImplantImages,
} from "../hooks/useMergedImplants";
import { brandAPI } from "../../services/api.js";

const normalizeText = (value) => String(value || "").trim();
const normalizeUpper = (value) => normalizeText(value).toUpperCase();
const normalizeLower = (value) => normalizeText(value).toLowerCase();

const isActiveImplant = (implant) =>
  String(implant?.status || "").trim().toLowerCase() === "active";

const getBrandsByCompany = (implantsList, companyName) => {
  const companyKey = normalizeLower(companyName);
  const map = new Map();

  (implantsList || []).forEach((item) => {
    if (!isActiveImplant(item)) return;

    const itemCompany = normalizeLower(item.company || item.brand);
    if (!itemCompany || itemCompany !== companyKey) return;

    const brandKey = normalizeUpper(item.brand);
    if (!brandKey) return;

    if (!map.has(brandKey)) {
      map.set(brandKey, {
        brand: brandKey,
        company: item.company || companyName,
        count: 0,
        country: item.country || item.countryText || "—",
      });
    }

    const row = map.get(brandKey);
    row.count += 1;

    if ((!row.country || row.country === "—") && (item.country || item.countryText)) {
      row.country = item.country || item.countryText;
    }
  });

  return Array.from(map.values()).sort((a, b) => a.brand.localeCompare(b.brand));
};

export default function BrandDetail() {
  const { brand } = useParams();
  const [searchParams] = useSearchParams();

  const company = searchParams.get("company") || "";
  const isCompanyMode = !!normalizeText(company);

  const normalizedBrandName = normalizeUpper(brand);
  const normalizedCompanyName = normalizeText(company);

  const { implants: mergedImplants, loading } = useMergedImplants();
  const [brandInfo, setBrandInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBrandInfo() {
      if (isCompanyMode) {
        if (isMounted) setBrandInfo(null);
        return;
      }

      try {
        const allBrands = await brandAPI.getAll();
        const found = (allBrands || []).find(
          (b) => normalizeUpper(b.name || b.brand_name) === normalizedBrandName
        );
        if (isMounted) setBrandInfo(found || null);
      } catch (err) {
        console.error("Error loading brand info:", err);
        if (isMounted) setBrandInfo(null);
      }
    }

    loadBrandInfo();

    return () => {
      isMounted = false;
    };
  }, [isCompanyMode, normalizedBrandName]);

  const activeImplants = useMemo(() => {
    return (mergedImplants || []).filter(isActiveImplant);
  }, [mergedImplants]);

  const filteredImplants = useMemo(() => {
    if (isCompanyMode) return [];
    return activeImplants.filter(
      (item) => normalizeUpper(item.brand) === normalizedBrandName
    );
  }, [activeImplants, isCompanyMode, normalizedBrandName]);

  const groupedBrands = useMemo(() => {
    if (!isCompanyMode) return [];
    return getBrandsByCompany(activeImplants, normalizedCompanyName);
  }, [activeImplants, isCompanyMode, normalizedCompanyName]);

  const brandCompanyName = brandInfo?.companyName || "";
  const brandWebsiteUrl = brandInfo?.website || "";
  const websiteHostname = brandWebsiteUrl
    ? brandWebsiteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "")
    : "";

  const primaryCountryValue = isCompanyMode
    ? groupedBrands[0]?.country || "—"
    : filteredImplants[0]?.country || filteredImplants[0]?.countryText || "—";

  const totalCount = isCompanyMode ? groupedBrands.length : filteredImplants.length;

  const pageTitle = isCompanyMode ? normalizedCompanyName : normalizedBrandName;
  const pageSubtitle = isCompanyMode
    ? "Browse brands under this company"
    : brandCompanyName
    ? `Operated by ${brandCompanyName}`
    : "";

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Implants", to: "/implants" },
          { label: pageTitle },
        ]}
      />

      <div className={styles.brandDetailContainer}>
        <div className={styles.brandHeader}>
          <div className={styles.brandLogoBox}>
            <div className={styles.brandLogoPlaceholder}>
              <span>{pageTitle}</span>
            </div>
          </div>

          <div className={styles.brandInfo}>
            <div>
              <h1 className={styles.brandTitle}>
                {pageTitle}
                {!isCompanyMode && <sup>®</sup>}
              </h1>
              {pageSubtitle && (
                <p className={styles.brandCompany}>{pageSubtitle}</p>
              )}
            </div>

            {!isCompanyMode && brandWebsiteUrl && (
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
                  <span className={styles.brandMetaText}>{primaryCountryValue}</span>
                </div>
              </div>

              <div className={styles.brandMetaCard}>
                <span className={styles.brandMetaLabel}>
                  {isCompanyMode ? "Available Brands" : "Available Models"}
                </span>
                <div className={styles.brandMetaValue}>
                  <span className={styles.brandMetaText}>
                    {totalCount > 0 ? totalCount.toLocaleString() : "—"}
                  </span>
                </div>
              </div>

              <div className={styles.brandMetaCard}>
                <span className={styles.brandMetaLabel}>
                  {isCompanyMode ? "Brand References" : "Implant References"}
                </span>
                <div className={styles.brandMetaValue}>
                  <span className={styles.brandMetaText}>
                    {totalCount > 0 ? totalCount.toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabContent}>
          <h2 className={styles.sectionTitle}>
            {isCompanyMode ? "Brands" : "Implants"}
          </h2>

          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading…</p>
            </div>
          ) : isCompanyMode ? (
            groupedBrands.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No brands are catalogued for this company yet.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {groupedBrands.map((item) => (
                  <Link
                    key={item.brand}
                    to={`/implants/brand/${encodeURIComponent(item.brand)}`}
                    className={styles.brandWebsite}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <div
                      className={styles.brandMetaCard}
                      style={{ minHeight: 120 }}
                    >
                      <span className={styles.brandMetaLabel}>{item.brand}</span>
                      <div className={styles.brandMetaValue}>
                        <span className={styles.brandMetaText}>
                          {item.count} model{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : filteredImplants.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No implants are catalogued for this brand yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredImplants.map((item) => {
                const primaryImage =
                  pickImplantImages(item).find((img) => img.dataUrl)?.dataUrl || "";
                const companyValue = item.company || item.brand;

                return (
                  <ImplantCard
                    key={item.slug || item.id}
                    title={item.name}
                    company={companyValue}
                    slug={item.slug}
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