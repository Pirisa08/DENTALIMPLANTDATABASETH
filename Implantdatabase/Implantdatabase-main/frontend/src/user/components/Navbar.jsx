import React, { useState, useEffect } from "react";
import { getInitialNightMode, setNightMode } from "../nightModeUtils";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import FilterSidebar from "./FilterSidebar";

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

export default function Navbar() {
  const navigate = useNavigate();

  const [nightMode, setNightModeState] = useState(getInitialNightMode());

  useEffect(() => {
    document.body.classList.toggle("night-mode", nightMode);
    setNightMode(nightMode);
  }, [nightMode]);

  const handleToggleNightMode = () => setNightModeState((v) => !v);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterSearch = (filterData) => {
    const filtersToSend = filterData || filters;
    const isEmpty = Object.values(filtersToSend || {}).every(
      (arr) => Array.isArray(arr) && arr.length === 0
    );

    navigate("/implants", {
      state: {
        filters: filtersToSend,
        searchQuery: searchQuery,
      },
      replace: true,
    });

    if (isEmpty) {
      setFilters(emptyFilters);
      setSearchQuery("");
    }

    setFilterOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/implants", {
        state: { searchQuery: searchQuery.trim() },
      });
      setSearchQuery("");
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.brand} onClick={() => navigate("/")}>
          <span className={styles.brandIcon}>🏥</span>
          <span className={styles.logoText}>Implant Dental</span>
        </div>

        <nav className={styles.navLinks} aria-label="Primary">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            Blog
          </NavLink>

          <NavLink
            to="/implants"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            Implants
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            Contact Us
          </NavLink>
        </nav>

        <div className={styles.right}>
          <button
            className={styles.nightModeBtn}
            type="button"
            aria-label={nightMode ? "ปิดโหมดกลางคืน" : "เปิดโหมดกลางคืน"}
            title={nightMode ? "ปิดโหมดกลางคืน" : "เปิดโหมดกลางคืน"}
            onClick={handleToggleNightMode}
          >
            <span
              className={styles.nightModeIcon}
              aria-hidden="true"
              style={{ color: nightMode ? "#ffe066" : "#888" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 13.5C16.5 13.8333 15.5 14 14.5 14C10.3579 14 7 10.6421 7 6.5C7 5.5 7.16667 4.5 7.5 3.5C4.5 4.83333 2.5 7.83333 2.5 11C2.5 15.1421 5.85786 18.5 10 18.5C13.1667 18.5 16.1667 16.5 17.5 13.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <form onSubmit={handleSearch} className={styles.searchBox}>
            <span className={styles.searchIcon}>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="11"
      cy="11"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M20 20L17 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</span>
            <input
              className={styles.searchInput}
              placeholder="Search implants, brands..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          <button
            className={styles.filterBtn}
            type="button"
            aria-label="Filters"
            title="Filters"
            onClick={() => setFilterOpen(true)}
          >
            <span className={styles.filterIcon}>☰</span>
            <span className={styles.filterText}>Filters</span>
          </button>
        </div>
      </header>

      <FilterSidebar
        open={filterOpen}
        value={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
        onSearch={handleFilterSearch}
      />
    </>
  );
}