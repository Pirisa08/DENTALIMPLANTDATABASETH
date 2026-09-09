import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./ImplantDatabase.module.css";
import useMergedImplants from "../hooks/useMergedImplants";
import useFilterOptions from "../hooks/useFilterOptions";

const emptyFilters = {
  company: [],
  level: [],
  connectionType: [],
  connectionShape: [],
  screwdriverShape: [],
  headShape: [],
  bodyShape: [],
  apexShape: [],
  country: [],
  officialDistributor: [],
};

const normalizeText = (value) => String(value || "").trim();
const normalizeLower = (value) => normalizeText(value).toLowerCase();

const normalizeCountry = (country) => {
  if (!country) return "";
  const normalized = String(country).toLowerCase().trim();

  if (normalized.includes("korea") || normalized.includes("republic of korea")) {
    return "South Korea";
  }
  if (normalized.includes("united states") || normalized === "usa") {
    return "USA";
  }
  if (normalized.includes("switzerland")) return "Switzerland";
  if (normalized.includes("germany")) return "Germany";
  if (normalized.includes("brazil")) return "Brazil";
  if (normalized.includes("japan")) return "Japan";
  if (normalized.includes("sweden")) return "Sweden";
  if (normalized.includes("israel")) return "Israel";
  if (normalized.includes("france")) return "France";
  if (normalized.includes("italy")) return "Italy";

  return normalizeText(country);
};

const getImplantValue = (implant, key) => {
  switch (key) {
    case "company":
      return implant?.company?.name || implant?.company || "";
    case "level":
      return implant?.level?.name || implant?.level || "";
    case "country":
      return normalizeCountry(
        implant?.country?.name || implant?.country || implant?.countryText || ""
      );
    case "connectionType":
      return implant?.connectionType || "";
    case "connectionShape":
      return implant?.connectionShape || "";
    case "screwdriverShape":
      return implant?.screwdriverShape || "";
    case "headShape":
      return implant?.headShape || "";
    case "bodyShape":
      return implant?.bodyShape || "";
    case "apexShape":
      return implant?.apexShape || "";
    case "officialDistributor":
      return implant?.officialDistributor || "";
    default:
      return "";
  }
};

const implantMatchesFilters = (implant, filters, searchQuery) => {
  const brand = normalizeText(implant?.brand);
  const name = normalizeText(implant?.name);
  const company = normalizeText(implant?.company?.name || implant?.company);
  const country = normalizeCountry(
    implant?.country?.name || implant?.country || implant?.countryText || ""
  );

  if (searchQuery) {
    const q = normalizeLower(searchQuery);
    const haystack = [
      brand,
      name,
      company,
      country,
      implant?.connectionType,
      implant?.connectionShape,
      implant?.officialDistributor,
    ]
      .map(normalizeLower)
      .join(" ");

    if (!haystack.includes(q)) return false;
  }

  for (const key of Object.keys(emptyFilters)) {
    const selected = filters?.[key] || [];
    if (!selected.length) continue;

    const implantValue = normalizeLower(getImplantValue(implant, key));
    const selectedValues = selected.map((v) =>
      key === "country" ? normalizeLower(normalizeCountry(v)) : normalizeLower(v)
    );

    if (!selectedValues.includes(implantValue)) {
      return false;
    }
  }

  return true;
};

const groupBrandsFromImplants = (implantsList) => {
  const map = new Map();

  (implantsList || []).forEach((implant) => {
    const rawBrand = normalizeText(implant?.brand);
    if (!rawBrand) return;

    const brandKey = rawBrand.toUpperCase();
    const companyName =
      implant?.company?.name || implant?.company || rawBrand;
    const countryName = normalizeCountry(
      implant?.country?.name || implant?.country || implant?.countryText || "—"
    );

    if (!map.has(brandKey)) {
      map.set(brandKey, {
        brand: rawBrand,
        company: normalizeText(companyName),
        count: 0,
        country: countryName || "—",
        website: implant?.website || "",
        description: implant?.brandDescription || "",
      });
    }

    const row = map.get(brandKey);
    row.count += 1;

    if (!row.website && implant?.website) {
      row.website = implant.website;
    }

    if (!row.description && implant?.brandDescription) {
      row.description = implant.brandDescription;
    }

    if ((!row.country || row.country === "—") && countryName) {
      row.country = countryName;
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    String(a.brand).localeCompare(String(b.brand))
  );
};

export default function ImplantDatabase() {
  const location = useLocation();
  const { implants, loading } = useMergedImplants();
  const { options } = useFilterOptions();

  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || "");
  const [filters, setFilters] = useState(location.state?.filters || emptyFilters);

  useEffect(() => {
    if (location.state?.searchQuery !== undefined) {
      setSearchQuery(location.state.searchQuery || "");
    }

    if (location.state?.filters) {
      setFilters({
        ...emptyFilters,
        ...location.state.filters,
      });
    }
  }, [location.state]);

  const activeImplants = useMemo(() => {
    return (implants || []).filter(
      (i) => String(i?.status || "").trim().toLowerCase() === "active"
    );
  }, [implants]);

  const allBrands = useMemo(() => {
    return groupBrandsFromImplants(activeImplants);
  }, [activeImplants]);

  const filteredImplants = useMemo(() => {
    return activeImplants.filter((implant) =>
      implantMatchesFilters(implant, filters, searchQuery)
    );
  }, [activeImplants, filters, searchQuery]);

  const filteredBrands = useMemo(() => {
    return groupBrandsFromImplants(filteredImplants);
  }, [filteredImplants]);

  const stats = {
    totalBrands: allBrands.length,
    displayedBrands: filteredBrands.length,
    totalSystems: filteredImplants.length,
  };

  const toggleFilter = (groupKey, value) => {
    setFilters((prev) => {
      const current = prev[groupKey] || [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [groupKey]: next,
      };
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters(emptyFilters);
  };

  const hasActiveFilters =
    !!searchQuery ||
    Object.values(filters).some((arr) => Array.isArray(arr) && arr.length > 0);

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Implants" },
        ]}
      />

      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Dental Implant Database</h1>
              <p className={styles.subtitle}>
                Explore our comprehensive collection of professional implant systems from leading manufacturers worldwide.
              </p>
            </div>

            <div className={styles.statsPanel}>
              <div className={styles.statCard}>
                <span className={styles.statTitle}>Total Brands</span>
                <span className={styles.statNumber}>{stats.totalBrands}</span>
                <span className={styles.statNote}>Grouped from all implants</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statTitle}>Currently Showing</span>
                <span className={styles.statNumber}>{stats.displayedBrands}</span>
                <span className={styles.statNote}>Grouped after filtering</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statTitle}>Matching Systems</span>
                <span className={styles.statNumber}>{stats.totalSystems}</span>
                <span className={styles.statNote}>Filtered implant rows</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <aside className={styles.filterSidebar}>
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className={styles.clearBtn}>
                  Clear All
                </button>
              )}
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Search</label>
              <input
                type="text"
                placeholder="Search implants or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {Object.entries({
              Company: ["company", options.company || []],
              "Implant Level": ["level", options.level || []],
              "Connection Type": ["connectionType", options.connectionType || []],
              "Connection Shape": ["connectionShape", options.connectionShape || []],
              "Screwdriver Shape": ["screwdriverShape", options.screwdriverShape || []],
              "Head Shape": ["headShape", options.headShape || []],
              "Body Shape": ["bodyShape", options.bodyShape || []],
              "Apex Shape": ["apexShape", options.apexShape || []],
              Country: ["country", options.country || []],
              "Official Distributor": ["officialDistributor", options.officialDistributor || []],
            }).map(([label, [key, sectionOptions]]) =>
              sectionOptions.length > 0 ? (
                <div className={styles.filterSection} key={key}>
                  <label className={styles.filterLabel}>
                    {label} {(filters[key] || []).length > 0 ? `(${(filters[key] || []).length})` : ""}
                  </label>

                  <div className={styles.filterOptions}>
                    {sectionOptions.map((option) => (
                      <label key={option} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={(filters[key] || []).includes(option)}
                          onChange={() => toggleFilter(key, option)}
                        />
                        <span className={styles.filterOptionText}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </aside>

          <div className={styles.mainContent}>
            {loading ? (
              <div className={`${styles.emptyState} ${styles.loadingState}`}>
                <div className={styles.loadingMark} aria-hidden="true">
                  <span></span>
                </div>
                <p>Loading implant brands...</p>
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No brands found matching your filters.</p>
                <button onClick={clearAllFilters} className={styles.resetBtn}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={styles.brandGrid}>
                {filteredBrands.map((brandRow) => (
                  <Link
                    key={brandRow.brand}
                    to={`/implants/brand/${encodeURIComponent(brandRow.brand)}`}
                    className={styles.brandCard}
                  >
                    <div className={styles.brandName}>{brandRow.brand}</div>
                    <div className={styles.brandCompany}>{brandRow.company}</div>
                    <div className={styles.brandCount}>
                      {brandRow.count} models catalogued
                    </div>
                    <div className={styles.brandBtn}>View Brand</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
