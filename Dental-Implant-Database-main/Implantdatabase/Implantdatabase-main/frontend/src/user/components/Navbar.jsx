import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getInitialNightMode, setNightMode } from "../nightModeUtils";
import FilterSidebar from "./FilterSidebar";
import styles from "./Navbar.module.css";

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
  const location = useLocation();
  const searchInputRef = useRef(null);
  const lastScrollYRef = useRef(0);

  const [nightMode, setNightModeState] = useState(getInitialNightMode());
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bottomNavHidden, setBottomNavHidden] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.body.classList.toggle("night-mode", nightMode);
    setNightMode(nightMode);
  }, [nightMode]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setBottomNavHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (Math.abs(scrollDelta) < 8) {
        return;
      }

      if (currentScrollY < 80 || scrollDelta < 0) {
        setBottomNavHidden(false);
      } else {
        setBottomNavHidden(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleToggleNightMode = () => {
    setNightModeState((prev) => !prev);
  };

  const handleFilterSearch = (filterData) => {
    const filtersToSend = filterData || filters;
    const isEmpty = Object.values(filtersToSend || {}).every(
      (arr) => Array.isArray(arr) && arr.length === 0
    );

    navigate("/implants", {
      state: {
        filters: filtersToSend,
        searchQuery,
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
    setMenuOpen(false);
    setSearchOpen(false);
    navigate("/implants", {
      state: { searchQuery: searchQuery.trim() },
    });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <>
      <header className={styles.navbar}>
        <div
          className={styles.brand}
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/");
            }
          }}
          aria-label="Go to homepage"
        >
          <div className={styles.brandIcon}>
            <img
              src="/logo_mfu.jpg"
              alt="Mae Fah Luang University logo"
              className={styles.brandLogoImg}
            />
          </div>

          <div className={styles.brandTextGroup}>
            <span className={styles.logoText}>MFU Dental</span>
            <span className={styles.logoSubText}>Implant Database</span>
          </div>
        </div>

        <nav className={styles.navLinks} aria-label="Primary Navigation">
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

        <button
          className={styles.menuBtn}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => {
            setSearchOpen(false);
            setMenuOpen((prev) => !prev);
          }}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </button>

        <div className={styles.right}>
          <button
            className={styles.nightModeBtn}
            type="button"
            aria-label={nightMode ? "Turn off night mode" : "Turn on night mode"}
            title={nightMode ? "Turn off night mode" : "Turn on night mode"}
            onClick={handleToggleNightMode}
          >
            <span
              className={styles.nightModeIcon}
              aria-hidden="true"
              style={{ color: nightMode ? "#f5d76e" : "#6b7280" }}
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

          <form
            onSubmit={handleSearch}
            className={`${styles.searchBox} ${searchOpen ? styles.searchOpen : ""}`}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            <button
              type="button"
              className={styles.searchIconBtn}
              aria-label="Open search"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="10.8"
                  cy="10.8"
                  r="6.6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.2 16.2L20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <input
              className={styles.searchInput}
              ref={searchInputRef}
              type="text"
              placeholder="Search implants, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
            />

            {(searchOpen || searchQuery) && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                aria-label="Close search"
              >
                ×
              </button>
            )}
          </form>

          <button
            className={styles.filterBtn}
            type="button"
            aria-label="Open filters"
            title="Open filters"
            onClick={() => setFilterOpen(true)}
          >
            <span className={styles.filterIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 7H19L14 12.8V18L10 20V12.8L5 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.filterText}>Filters</span>
          </button>
        </div>

        <nav
          className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
          aria-label="Mobile Navigation"
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.mobileNavItem} ${styles.mobileActive}` : styles.mobileNavItem
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive ? `${styles.mobileNavItem} ${styles.mobileActive}` : styles.mobileNavItem
            }
          >
            Blog
          </NavLink>

          <NavLink
            to="/implants"
            className={({ isActive }) =>
              isActive ? `${styles.mobileNavItem} ${styles.mobileActive}` : styles.mobileNavItem
            }
          >
            Implants
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? `${styles.mobileNavItem} ${styles.mobileActive}` : styles.mobileNavItem
            }
          >
            Contact
          </NavLink>

          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => {
              setMenuOpen(false);
              setFilterOpen(true);
            }}
          >
            Filter implants
          </button>
        </nav>
      </header>

      <nav
        className={`${styles.mobileBottomNav} ${
          bottomNavHidden ? styles.mobileBottomHidden : ""
        }`}
        aria-label="Mobile bottom navigation"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? `${styles.mobileBottomItem} ${styles.mobileBottomActive}`
              : styles.mobileBottomItem
          }
        >
          <span className={styles.mobileBottomIcon} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 11.2L12 5L19.5 11.2V19H15V14.5H9V19H4.5V11.2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/blog"
          className={({ isActive }) =>
            isActive
              ? `${styles.mobileBottomItem} ${styles.mobileBottomActive}`
              : styles.mobileBottomItem
          }
        >
          <span className={styles.mobileBottomIcon} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 5H18C19.1 5 20 5.9 20 7V18.5C20 19.3 19.3 20 18.5 20H6.5C5.1 20 4 18.9 4 17.5V7C4 5.9 4.9 5 6 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span>Blog</span>
        </NavLink>

        <NavLink
          to="/implants"
          className={({ isActive }) =>
            isActive
              ? `${styles.mobileBottomItem} ${styles.mobileBottomActive}`
              : styles.mobileBottomItem
          }
        >
          <span className={styles.mobileBottomIcon} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.2 4.5H14.8L17 9.4L14.9 19.5H9.1L7 9.4L9.2 4.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8.2 9.5H15.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 9.5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span>Implants</span>
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive
              ? `${styles.mobileBottomItem} ${styles.mobileBottomActive}`
              : styles.mobileBottomItem
          }
        >
          <span className={styles.mobileBottomIcon} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 6H19V16H9L5 19V6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8.5 10H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8.5 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span>Contact</span>
        </NavLink>
      </nav>

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
