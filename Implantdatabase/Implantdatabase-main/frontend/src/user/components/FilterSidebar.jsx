import React, { useEffect, useState } from "react";
import styles from "./FilterSidebar.module.css";
import { loadMaster } from "../../admin/pages/masterDataStore.js";
import { masterDataAPI } from "../../services/api.js";

// Normalize country names
const normalizeCountry = (country) => {
  if (!country) return "";
  const normalized = country.toLowerCase().trim();
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
  // Default: return first word capitalized
  return country.split(/[\s,/]/).filter(w => w)[0] || country;
};

const SECTIONS = [
  { key: "company", title: "Company", masterKey: "company" },
  { key: "level", title: "Level", masterKey: "level" },
  { key: "connectionType", title: "Connection Type", masterKey: "connectionType" },
  { key: "connectionShape", title: "Connection Shape", masterKey: "connectionShape" },
  { key: "screwdriverShape", title: "Screwdriver Shape", masterKey: "screwdriverShape" },
  { key: "headShape", title: "Head Shape", masterKey: "headShape" },
  { key: "bodyShape", title: "Body Shape", masterKey: "bodyShape" },
  { key: "apexShape", title: "Apex Shape", masterKey: "apexShape" },
  { key: "country", title: "Country", masterKey: "country" },
  { key: "officialDistributor", title: "Official Distributor", masterKey: "officialDistributor" },
];

export default function FilterSidebar({
  open,
  value,
  onChange,
  onClose,
  onSearch,
}) {
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        
        // โหลดจาก localStorage ก่อน
        const localMaster = loadMaster();
        
        // โหลดจาก API
        const [apiCompanies, apiLevels, apiCountries] = await Promise.all([
          masterDataAPI.getCompanies(),
          masterDataAPI.getLevels(),
          masterDataAPI.getCountries(),
        ]);
        
        // ผสมข้อมูลจาก API และ localStorage
        const mergeAndFilter = (apiData, localData, masterKey) => {
          const localArray = Array.isArray(localData) ? localData : [];
          const map = new Map();
          
          // เพิ่มจาก API
          apiData.forEach(item => {
            if (item && item.name && item.status === 'Active') {
              map.set(item.name, item);
            }
          });
          
          // เพิ่มจาก localStorage
          localArray.forEach(item => {
            if (item && item.name && item.status === 'Active' && !map.has(item.name)) {
              map.set(item.name, item);
            }
          });
          
          return Array.from(map.values())
            .map(item => item.name)
            .sort();
        };
        
        const sanitize = (arr) => Array.isArray(arr)
          ? arr.filter(name => name && name.toLowerCase() !== 'hatyai')
          : [];

        const newOptions = {
          company: sanitize(mergeAndFilter(apiCompanies, localMaster.company, 'company')),
          level: sanitize(mergeAndFilter(apiLevels, localMaster.level, 'level')),
          country: sanitize(mergeAndFilter(apiCountries, localMaster.country, 'country')),
          connectionType: Array.isArray(localMaster.connectionType) 
            ? sanitize(localMaster.connectionType.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          connectionShape: Array.isArray(localMaster.connectionShape)
            ? sanitize(localMaster.connectionShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          screwdriverShape: Array.isArray(localMaster.screwdriverShape)
            ? sanitize(localMaster.screwdriverShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          headShape: Array.isArray(localMaster.headShape)
            ? sanitize(localMaster.headShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          bodyShape: Array.isArray(localMaster.bodyShape)
            ? sanitize(localMaster.bodyShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          apexShape: Array.isArray(localMaster.apexShape)
            ? sanitize(localMaster.apexShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          officialDistributor: Array.isArray(localMaster.officialDistributor)
            ? sanitize(localMaster.officialDistributor.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
        };
        
        setOptions(newOptions);
      } catch (err) {
        console.error('Error loading filter options:', err);
        // Fallback to localStorage only
        const localMaster = loadMaster();
        const fallbackOptions = {};
        SECTIONS.forEach(sec => {
          const data = localMaster[sec.masterKey];
          fallbackOptions[sec.key] = Array.isArray(data)
            ? data.filter(x => x.status === 'Active').map(x => x.name).sort()
            : [];
        });
        setOptions(fallbackOptions);
      } finally {
        setLoading(false);
      }
    }
    
    if (open) {
      loadOptions();
    }
    
    // Listen for storage changes
    const handleStorageChange = () => {
      if (open) loadOptions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [open]);

  if (!open) return null;

  const toggle = (groupKey, option) => {
    const cur = value?.[groupKey] || [];
    // Allow multiple selections per group
    const next = cur.includes(option) 
      ? cur.filter(item => item !== option)
      : [...cur, option];
    const updatedFilters = { ...value, [groupKey]: next };
    onChange(updatedFilters);
    // Auto search when filter changes (don't close sidebar)
    onSearch(updatedFilters);
  };

  const clearAll = () => {
    const empty = {};
    SECTIONS.forEach((s) => (empty[s.key] = []));
    onChange(empty);
    // Auto search after clearing
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
            <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading filters...
            </div>
          ) : (
            SECTIONS.map((sec) => {
              const sectionOptions = options[sec.key] || [];
              if (sectionOptions.length === 0) return null;
              
              return (
                <div key={sec.key} className={styles.section}>
                  <div className={styles.sectionTitle}>{sec.title}</div>

                  <div className={styles.list}>
                    {sectionOptions.map((opt) => {
                      const checked = (value?.[sec.key] || []).includes(opt);
                      return (
                        <label key={opt} className={styles.item}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(sec.key, opt)}
                          />
                          <span>{opt}</span>
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
          <button className={styles.searchBtn} type="button" onClick={() => onSearch(value)}>
            Search
          </button>
        </div>
      </aside>
    </div>
  );
}
