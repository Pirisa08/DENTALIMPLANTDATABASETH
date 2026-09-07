import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerGrid}>
          <div className={styles.footerColumn}>
            <div className={styles.brandBlock}>
              <img
                src="/logo_mfu.jpg"
                alt="MFU Logo"
                className={styles.brandLogo}
              />

              <div className={styles.brandText}>
                <h2 className={styles.footerTitle}>MFU Dental</h2>
                <p className={styles.footerSubTitle}>IMPLANT DATABASE</p>
              </div>
            </div>

            <p className={styles.footerDesc}>
              A reference platform for dental implant information, brand
              organization, and clinical system cataloguing under Mae Fah Luang
              University.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Navigation</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/implants">Implants</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Powered By</h3>

            <div className={styles.poweredInfo}>
              <p>School of Applied Digital Technology</p>
              <p>School of Dentistry</p>
              <p>Mae Fah Luang University</p>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Contact</h3>

            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Institution</span>
                <p>Mae Fah Luang University</p>
              </div>

              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>System</span>
                <p>MFU Dental Implant Database</p>
              </div>

              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Purpose</span>
                <p>Educational and reference use</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <p className={styles.copyright}>
            © 2025 MFU Dental Implant Database. All rights reserved.
          </p>

          <div className={styles.legalLinks}>
            <Link to="/">Home</Link>
            <span className={styles.divider}>|</span>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}