import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogsAPI, brandAPI, implantsAPI, masterDataAPI } from '../../services/api.js';
import { searchSite } from './siteSearch.js';
import styles from './SiteSearchResults.module.css';

export default function SiteSearchResults({ query, onSelect }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      masterDataAPI.getCompanies(), brandAPI.getAll(), blogsAPI.getAll(), implantsAPI.getAll(),
    ]).then(results => {
      if (cancelled) return;
      const keys = ['companies', 'brands', 'blogs', 'implants'];
      const next = {};
      results.forEach((result, i) => {
        next[keys[i]] = result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : [];
      });
      setData(next);
      setError(results.some(result => result.status === 'rejected'));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const groups = useMemo(() => searchSite(data, query), [data, query]);
  const total = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <div className={styles.results} id="site-search-results" aria-label="Search results" aria-busy={loading}>
      <p className={styles.status} role="status">
        {!query.trim() ? 'Search companies, brands, blog posts, or implants.'
          : loading ? 'Searching...'
          : total ? `${total} results` : 'No results found. Try another search.'}
      </p>
      {error && <p className={styles.status}>Some results could not be loaded. Please try again.</p>}
      {!loading && query.trim() && groups.filter(group => group.items.length > 0).map(group => (
        <section key={group.label}>
          <h2 className={styles.heading}>{group.label} ({group.items.length})</h2>
          <ul className={styles.list}>
            {group.items.map(item => (
              <li key={item.id ?? item.to}>
                <Link className={styles.item} to={item.to} onClick={onSelect}>
                  <span className={styles.title}>{item.title}</span>
                  {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
