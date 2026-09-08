import React from "react";
import styles from "./FilterSidebar.module.css";
import useFilterOptions from "../hooks/useFilterOptions";

const SECTIONS = [
  { key: "company", title: "Company" },
  { key: "level", title: "Level" },
  { key: "connectionType", title: "Connection Type" },
  { key: "connectionShape", title: "Connection Shape" },
  { key: "screwdriverShape", title: "Screwdriver Shape" },
  { key: "headShape", title: "Head Shape" },
  { key: "bodyShape", title: "Body Shape" },
  { key: "apexShape", title: "Apex Shape" },
  { key: "country", title: "Country" },
  { key: "officialDistributor", title: "Official Distributor" },
];

export default function FilterSidebar({
  open,
  value,
  onChange,
  onClose,
  onSearch,
}) {
  const { options, loading } = useFilterOptions();

  if (!open) return null;

  const toggle = (groupKey, option) => {
    const current = value?.[groupKey] || [];
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];

    const updatedFilters = { ...value, [groupKey]: next };
    onChange(updatedFilters);
  };

  const clearAll = () => {
    const empty = {};
    SECTIONS.forEach((section) => {
      empty[section.key] = [];
    });
    onChange(empty);
    onSearch(empty);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Filters</div>
          <div className={styles.headerBtns}>
            <button className={styles.linkBtn} type="button" onClick={clearAll}>
              Clear
            </button>
            <button
              className={styles.closeBtn}
              type="button"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading filters...
            </div>
          ) : (
            SECTIONS.map((section) => {
              const sectionOptions = options?.[section.key] || [];
              if (sectionOptions.length === 0) return null;

              return (
                <div key={section.key} className={styles.section}>
                  <div className={styles.sectionTitle}>{section.title}</div>

                  <div className={styles.list}>
                    {sectionOptions.map((option) => {
                      const checked = (value?.[section.key] || []).includes(option);

                      return (
                        <label key={option} className={styles.item}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(section.key, option)}
                          />
                          <span className={styles.itemText}>{option}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className={styles.divider} />
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.searchBtn}
            type="button"
            onClick={() => onSearch(value)}
          >
            Search
          </button>
        </div>
      </aside>
    </div>
  );
}
