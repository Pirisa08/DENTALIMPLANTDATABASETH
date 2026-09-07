import React from "react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  const activeIndex = items.length - 1;
  const backTarget = [...items]
    .slice(0, activeIndex)
    .reverse()
    .find((item) => Boolean(item.to));

  const handleBack = (e) => {
    if (!backTarget) {
      e.preventDefault();
      window.history.back();
    }
  };

  return (
    <nav className={styles.wrap} aria-label="Breadcrumb">
      <div className={styles.inner}>
        <div className={styles.leading}>
          {backTarget ? (
            <Link
              to={backTarget.to}
              className={styles.backButton}
              aria-label={`Back to ${backTarget.label}`}
            >
              <span aria-hidden="true" className={styles.backIcon}>
                ‹
              </span>
            </Link>
          ) : (
            <a
              href="#"
              className={styles.backButton}
              aria-label="Go back"
              onClick={handleBack}
            >
              <span className={styles.backIcon}>‹</span>
            </a>
          )}

          {items.map((item, idx) => {
            const isLast = idx === activeIndex;
            const isLink = item.to && !isLast;

            return (
              <React.Fragment key={`${item.label}-${idx}`}>
                {idx > 0 && <span className={styles.divider} aria-hidden="true" />}
                {isLink ? (
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? styles.current : styles.label}>{item.label}</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
