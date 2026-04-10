import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import styles from "./ImplantDatabase.module.css";
import { implants as staticImplants } from "../data/implants";
import { loadMaster } from "../../admin/pages/masterDataStore.js";
import { masterDataAPI, implantsAPI } from "../../services/api.js";

// Key for admin implants storage
const ADMIN_IMPLANTS_KEY = "admin_implants_v1";

// Build a stable key for implant to detect duplicates
const keyImplant = (it) => {
  const slug = (it.slug || "").trim().toLowerCase();
  if (slug) return `slug:${slug}`;
  const brand = (it.brand || "").trim().toLowerCase();
  const name = (it.name || "").trim().toLowerCase();
  if (brand && name) return `brandname:${brand}::${name}`;
  const id = String(it.id || "").trim();
  return `id:${id}`;
};

// Dedupe multiple lists, preferring items from earlier lists (API > admin > static)
const dedupeMultiple = (lists) => {
  const map = new Map();
  lists.forEach(list => {
    (list || []).forEach((it) => {
      const k = keyImplant(it);
      if (!map.has(k)) map.set(k, it);
    });
  });
  return Array.from(map.values());
};

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

/* ดึง brand ไม่ซ้ำ */
const getBrands = (implantsList) => {
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

// ดึงข้อมูลสำหรับ filters
const getFilterOptions = (implantsList) => {
  const brands = new Set();
  const companies = new Set();
  const countries = new Set();
  const connectionTypes = new Set();
  const connectionShapes = new Set();
  const levels = new Set();
  const screwdriverShapes = new Set();

  implantsList.forEach((implant) => {
    if (implant.brand) brands.add(implant.brand.toUpperCase());
    if (implant.company) companies.add(implant.company);
    if (implant.country) {
      // แยกประเทศออกจากข้อมูลที่มี Headquarters/Manufacturer
      const countryStr = implant.country;
      if (countryStr.includes('Switzerland')) countries.add('Switzerland');
      if (countryStr.includes('Germany')) countries.add('Germany');
      if (countryStr.includes('Korea')) countries.add('South Korea');
      if (countryStr.includes('USA') || countryStr.includes('United States')) countries.add('USA');
      if (countryStr.includes('Sweden')) countries.add('Sweden');
      if (countryStr.includes('Israel')) countries.add('Israel');
      if (countryStr.includes('France')) countries.add('France');
      if (countryStr.includes('Italy')) countries.add('Italy');
    }
    if (implant.connectionType) connectionTypes.add(implant.connectionType);
    if (implant.connectionShape) connectionShapes.add(implant.connectionShape);
    if (implant.level) levels.add(implant.level);
    if (implant.screwdriverShape) screwdriverShapes.add(implant.screwdriverShape);
  });

  return {
    brands: Array.from(brands).sort(),
    companies: Array.from(companies).sort(),
    countries: Array.from(countries).sort(),
    connectionTypes: Array.from(connectionTypes).sort(),
    connectionShapes: Array.from(connectionShapes).sort(),
    levels: Array.from(levels).sort(),
    screwdriverShapes: Array.from(screwdriverShapes).sort(),
  };
};

export default function ImplantDatabase() {
  const location = useLocation();
  
  // Load implants from API + admin localStorage + static data
  const [implants, setImplants] = useState([]);
  const [loadingImplants, setLoadingImplants] = useState(true);
  
  // Fetch implants from API and merge with localStorage
  useEffect(() => {
    async function loadImplants() {
      try {
        setLoadingImplants(true);
        
        // Try to fetch from API (MySQL database) first
        let apiImplants = [];
        try {
          apiImplants = await implantsAPI.getAll();
          if (!Array.isArray(apiImplants)) apiImplants = [];
          console.log("Loaded from API:", apiImplants.length, "implants");
        } catch (err) {
          console.warn("Failed to fetch implants from API:", err);
        }
        
        // Get from admin localStorage
        let adminImplants = [];
        try {
          const adminRaw = localStorage.getItem(ADMIN_IMPLANTS_KEY);
          if (adminRaw) {
            adminImplants = JSON.parse(adminRaw);
            if (!Array.isArray(adminImplants)) adminImplants = [];
            console.log("Loaded from localStorage:", adminImplants.length, "implants");
          }
        } catch (err) {
          console.error("Failed to parse admin implants:", err);
        }
        
        // Merge with de-duplication (prefer API > admin > static)
        const merged = dedupeMultiple([apiImplants, adminImplants, staticImplants]);
        setImplants(merged);
        console.log("Total merged implants:", merged.length);
      } catch (err) {
        console.error("Failed to load implants:", err);
        // Fallback to static data if everything fails
        setImplants(staticImplants);
      } finally {
        setLoadingImplants(false);
      }
    }
    
    loadImplants();
    
    // Refresh when admin makes changes in localStorage
    const handleStorageChange = () => {
      console.log("Storage changed, reloading implants...");
      loadImplants();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const allBrands = getBrands(implants);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    companies: [],
    countries: [],
    connectionTypes: [],
    connectionShapes: [],
    levels: [],
    screwdriverShapes: [],
    headShapes: [],
    bodyShapes: [],
    apexShapes: [],
    officialDistributors: [],
  });
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState([]);
  const [selectedConnectionShapes, setSelectedConnectionShapes] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedScrewdriverShapes, setSelectedScrewdriverShapes] = useState([]);
  const [selectedHeadShapes, setSelectedHeadShapes] = useState([]);
  const [selectedBodyShapes, setSelectedBodyShapes] = useState([]);
  const [selectedApexShapes, setSelectedApexShapes] = useState([]);
  const [selectedOfficialDistributors, setSelectedOfficialDistributors] = useState([]);

  // โหลด filter options จาก Master Data และ Implants
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        setLoadingFilters(true);
        
        // โหลดจาก localStorage ก่อน
        const localMaster = loadMaster();
        
        // โหลดจาก API
        let apiCompanies = [], apiLevels = [], apiCountries = [];
        try {
          [apiCompanies, apiLevels, apiCountries] = await Promise.all([
            masterDataAPI.getCompanies(),
            masterDataAPI.getLevels(),
            masterDataAPI.getCountries(),
          ]);
        } catch (err) {
          console.warn("API call failed, using localStorage only");
        }
        
        // ผสมข้อมูลจาก API และ localStorage
        const mergeAndFilter = (apiData, localData) => {
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
        
        // ใช้ getFilterOptions() เพื่อดึงข้อมูลจาก implants โดยตรง
        const implantFilters = getFilterOptions(implants);
        
        setFilterOptions({
          brands: implantFilters.brands,
          companies: sanitize(mergeAndFilter(apiCompanies, localMaster.company)),
          countries: sanitize(mergeAndFilter(apiCountries, localMaster.country)),
          connectionTypes: sanitize(implantFilters.connectionTypes),
          connectionShapes: sanitize(implantFilters.connectionShapes),
          levels: mergeAndFilter(apiLevels, localMaster.level),
          screwdriverShapes: sanitize(implantFilters.screwdriverShapes),
          headShapes: Array.isArray(localMaster.headShape)
            ? sanitize(localMaster.headShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          bodyShapes: Array.isArray(localMaster.bodyShape)
            ? sanitize(localMaster.bodyShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          apexShapes: Array.isArray(localMaster.apexShape)
            ? sanitize(localMaster.apexShape.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
          officialDistributors: Array.isArray(localMaster.officialDistributor)
            ? sanitize(localMaster.officialDistributor.filter(x => x.status === 'Active').map(x => x.name).sort())
            : [],
        });
      } catch (err) {
        console.error('Error loading filter options:', err);
        // Fallback to basic options
        setFilterOptions(getFilterOptions(implants));
      } finally {
        setLoadingFilters(false);
      }
    }
    
    loadFilterOptions();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadFilterOptions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [implants]);

  // รับค่า search query และ filters จาก Navbar
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }
    
    if (location.state?.filters) {
      const filterState = location.state.filters;
      console.log("Received filters:", filterState);
      setSelectedCompanies(filterState.company || []);
      setSelectedCountries(filterState.country || []);
      setSelectedConnectionTypes(filterState.connectionType || []);
      setSelectedConnectionShapes(filterState.connectionShape || []);
      setSelectedLevels(filterState.level || []);
      setSelectedScrewdriverShapes(filterState.screwdriverShape || []);
      setSelectedHeadShapes(filterState.headShape || []);
      setSelectedBodyShapes(filterState.bodyShape || []);
      setSelectedApexShapes(filterState.apexShape || []);
      setSelectedOfficialDistributors(filterState.officialDistributor || []);
    }
  }, [location.state]);

  // Sync sidebar filters to URL/navbar
  useEffect(() => {
    const currentFilters = {
      company: selectedCompanies,
      country: selectedCountries,
      connectionType: selectedConnectionTypes,
      connectionShape: selectedConnectionShapes,
      level: selectedLevels,
      screwdriverShape: selectedScrewdriverShapes,
      headShape: selectedHeadShapes,
      bodyShape: selectedBodyShapes,
      apexShape: selectedApexShapes,
      officialDistributor: selectedOfficialDistributors,
    };
    
    // Only update if there are active filters
    const hasFilters = Object.values(currentFilters).some(arr => arr.length > 0);
    if (hasFilters) {
      window.history.replaceState(
        { filters: currentFilters },
        document.title,
        window.location.pathname
      );
    }
  }, [
    selectedCompanies, 
    selectedCountries, 
    selectedConnectionTypes,
    selectedConnectionShapes,
    selectedLevels,
    selectedScrewdriverShapes,
    selectedHeadShapes,
    selectedBodyShapes,
    selectedApexShapes,
    selectedOfficialDistributors
  ]);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return allBrands.filter((b) => {
      // Search filter (brand, company, and country)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = b.brand.toLowerCase().includes(query);
        const matchCompany = b.company.toLowerCase().includes(query);
        const matchCountry = b.country.toLowerCase().includes(query);
        if (!matchName && !matchCompany && !matchCountry) return false;
      }

      // Brand filter (from inline filter)
      if (selectedBrands.length > 0) {
        const isBrandMatch = selectedBrands.some(brand =>
          b.brand.toLowerCase() === brand.toLowerCase()
        );
        if (!isBrandMatch) return false;
      }

      // Company filter (from Navbar FilterSidebar)
      if (selectedCompanies.length > 0) {
        const isCompanyMatch = selectedCompanies.some(company =>
          b.company.toLowerCase().includes(company.toLowerCase())
        );
        if (!isCompanyMatch) return false;
      }

      // Country filter (normalized)
      if (selectedCountries.length > 0) {
        const normalizedBrandCountry = normalizeCountry(b.country);
        const hasCountry = selectedCountries.some(country => 
          normalizedBrandCountry.toLowerCase() === country.toLowerCase()
        );
        if (!hasCountry) return false;
      }

      // Connection type filter - ตรวจสอบว่ามี implant ที่มี connection type นี้หรือไม่
      if (selectedConnectionTypes.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasConnectionType = brandImplants.some(implant =>
          selectedConnectionTypes.some(ct => 
            implant.connectionType?.toLowerCase().includes(ct.toLowerCase())
          )
        );
        if (!hasConnectionType) return false;
      }

      // Connection shape filter
      if (selectedConnectionShapes.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasConnectionShape = brandImplants.some(implant =>
          selectedConnectionShapes.some(shape => 
            implant.connectionShape?.toLowerCase().includes(shape.toLowerCase())
          )
        );
        if (!hasConnectionShape) return false;
      }

      // Level filter - ตรวจสอบว่ามี implant ที่มี level นี้หรือไม่
      if (selectedLevels.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasLevel = brandImplants.some(implant =>
          selectedLevels.some(level => 
            implant.level?.toLowerCase().includes(level.toLowerCase())
          )
        );
        if (!hasLevel) return false;
      }

      // Screwdriver shape filter
      if (selectedScrewdriverShapes.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasScrewdriverShape = brandImplants.some(implant =>
          selectedScrewdriverShapes.some(shape => 
            implant.screwdriverShape?.toLowerCase().includes(shape.toLowerCase())
          )
        );
        if (!hasScrewdriverShape) return false;
      }

      // Head shape filter
      if (selectedHeadShapes.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasHeadShape = brandImplants.some(implant =>
          selectedHeadShapes.some(shape => 
            implant.headShape?.toLowerCase().includes(shape.toLowerCase())
          )
        );
        if (!hasHeadShape) return false;
      }

      // Body shape filter
      if (selectedBodyShapes.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasBodyShape = brandImplants.some(implant =>
          selectedBodyShapes.some(shape => 
            implant.bodyShape?.toLowerCase().includes(shape.toLowerCase())
          )
        );
        if (!hasBodyShape) return false;
      }

      // Apex shape filter
      if (selectedApexShapes.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasApexShape = brandImplants.some(implant =>
          selectedApexShapes.some(shape => 
            implant.apexShape?.toLowerCase().includes(shape.toLowerCase())
          )
        );
        if (!hasApexShape) return false;
      }

      // Official distributor filter
      if (selectedOfficialDistributors.length > 0) {
        const brandImplants = implants.filter(
          (x) => (x.brand || "").toLowerCase() === b.brand.toLowerCase()
        );
        const hasDistributor = brandImplants.some(implant =>
          selectedOfficialDistributors.some(dist => 
            implant.officialDistributor?.toLowerCase().includes(dist.toLowerCase())
          )
        );
        if (!hasDistributor) return false;
      }

      return true;
    });

  }, [
    allBrands, 
    searchQuery, 
    selectedBrands,
    selectedCompanies,
    selectedCountries, 
    selectedConnectionTypes, 
    selectedConnectionShapes,
    selectedLevels,
    selectedScrewdriverShapes,
    selectedHeadShapes,
    selectedBodyShapes,
    selectedApexShapes,
    selectedOfficialDistributors
  ]);

  const stats = {
    totalBrands: allBrands.length,
    displayedBrands: filteredBrands.length,
    totalSystems: implants.length,
  };

  // Toggle filter selection - allows multiple selections
  const toggleFilter = (setter, value) => {
    setter((prev) =>
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBrands([]);
    setSelectedCompanies([]);
    setSelectedCountries([]);
    setSelectedConnectionTypes([]);
    setSelectedConnectionShapes([]);
    setSelectedLevels([]);
    setSelectedScrewdriverShapes([]);
    setSelectedHeadShapes([]);
    setSelectedBodyShapes([]);
    setSelectedApexShapes([]);
    setSelectedOfficialDistributors([]);
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedBrands.length > 0 || 
    selectedCompanies.length > 0 ||
    selectedCountries.length > 0 ||
    selectedConnectionTypes.length > 0 ||
    selectedConnectionShapes.length > 0 ||
    selectedLevels.length > 0 ||
    selectedScrewdriverShapes.length > 0 ||
    selectedHeadShapes.length > 0 ||
    selectedBodyShapes.length > 0 ||
    selectedApexShapes.length > 0 ||
    selectedOfficialDistributors.length > 0;

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
                <span className={styles.statNote}>Combined catalogue coverage</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statTitle}>Currently Showing</span>
                <span className={styles.statNumber}>{stats.displayedBrands}</span>
                <span className={styles.statNote}>Filtered in this view</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statTitle}>Total Systems</span>
                <span className={styles.statNumber}>{stats.totalSystems}</span>
                <span className={styles.statNote}>Implant models catalogued globally</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Sidebar Filter */}
          <aside className={styles.filterSidebar}>
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filters</h3>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className={styles.clearBtn}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Search</label>
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Brand Filter */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>
                Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`}
              </label>
              <div className={styles.filterOptions}>
                {filterOptions.brands.map((brand) => (
                  <label key={brand} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleFilter(setSelectedBrands, brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Company Filter */}
            {filterOptions.companies.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Company {selectedCompanies.length > 0 && `(${selectedCompanies.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.companies.map((company) => (
                    <label key={company} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company)}
                        onChange={() => toggleFilter(setSelectedCompanies, company)}
                      />
                      <span className={styles.filterOptionText}>{company}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Country Filter */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>
                Country {selectedCountries.length > 0 && `(${selectedCountries.length})`}
              </label>
              <div className={styles.filterOptions}>
                {filterOptions.countries.map((country) => (
                  <label key={country} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => toggleFilter(setSelectedCountries, country)}
                    />
                    <span className={styles.filterOptionText}>{country}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>
                Implant Level {selectedLevels.length > 0 && `(${selectedLevels.length})`}
              </label>
              <div className={styles.filterOptions}>
                {filterOptions.levels.map((level) => (
                  <label key={level} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleFilter(setSelectedLevels, level)}
                    />
                    <span className={styles.filterOptionText}>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Connection Type Filter */}
            {filterOptions.connectionTypes.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Connection Type {selectedConnectionTypes.length > 0 && `(${selectedConnectionTypes.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.connectionTypes.map((type) => (
                    <label key={type} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedConnectionTypes.includes(type)}
                        onChange={() => toggleFilter(setSelectedConnectionTypes, type)}
                      />
                      <span className={styles.filterOptionText}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Connection Shape Filter */}
            {filterOptions.connectionShapes.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Connection Shape {selectedConnectionShapes.length > 0 && `(${selectedConnectionShapes.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.connectionShapes.map((shape) => (
                    <label key={shape} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedConnectionShapes.includes(shape)}
                        onChange={() => toggleFilter(setSelectedConnectionShapes, shape)}
                      />
                      <span className={styles.filterOptionText}>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Screwdriver Shape Filter */}
            {filterOptions.screwdriverShapes.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Screwdriver Shape {selectedScrewdriverShapes.length > 0 && `(${selectedScrewdriverShapes.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.screwdriverShapes.map((shape) => (
                    <label key={shape} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedScrewdriverShapes.includes(shape)}
                        onChange={() => toggleFilter(setSelectedScrewdriverShapes, shape)}
                      />
                      <span className={styles.filterOptionText}>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Head Shape Filter */}
            {filterOptions.headShapes.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Head Shape {selectedHeadShapes.length > 0 && `(${selectedHeadShapes.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.headShapes.map((shape) => (
                    <label key={shape} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedHeadShapes.includes(shape)}
                        onChange={() => toggleFilter(setSelectedHeadShapes, shape)}
                      />
                      <span className={styles.filterOptionText}>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Body Shape Filter */}
            {filterOptions.bodyShapes.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Body Shape {selectedBodyShapes.length > 0 && `(${selectedBodyShapes.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.bodyShapes.map((shape) => (
                    <label key={shape} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedBodyShapes.includes(shape)}
                        onChange={() => toggleFilter(setSelectedBodyShapes, shape)}
                      />
                      <span className={styles.filterOptionText}>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Apex Shape Filter */}
            {filterOptions.apexShapes.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Apex Shape {selectedApexShapes.length > 0 && `(${selectedApexShapes.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.apexShapes.map((shape) => (
                    <label key={shape} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedApexShapes.includes(shape)}
                        onChange={() => toggleFilter(setSelectedApexShapes, shape)}
                      />
                      <span className={styles.filterOptionText}>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Official Distributor Filter */}
            {filterOptions.officialDistributors.length > 0 && (
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>
                  Official Distributor {selectedOfficialDistributors.length > 0 && `(${selectedOfficialDistributors.length})`}
                </label>
                <div className={styles.filterOptions}>
                  {filterOptions.officialDistributors.map((distributor) => (
                    <label key={distributor} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={selectedOfficialDistributors.includes(distributor)}
                        onChange={() => toggleFilter(setSelectedOfficialDistributors, distributor)}
                      />
                      <span className={styles.filterOptionText}>{distributor}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </aside>

          {/* Brand Grid */}
          <div className={styles.mainContent}>
            {filteredBrands.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No brands found matching your filters.</p>
                <button onClick={clearAllFilters} className={styles.resetBtn}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={styles.brandGrid}>
                {filteredBrands.map((b) => (
                  <Link
                    key={b.brand}
                    to={`/implants/brand/${b.brand}`}
                    className={styles.brandCard}
                  >
                    <div className={styles.brandName}>{b.brand}</div>
                    <div className={styles.brandCompany}>{b.company}</div>
                    <div className={styles.brandCount}>{b.count} models catalogued</div>
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
