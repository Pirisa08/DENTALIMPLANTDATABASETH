import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className={styles.footer}>
            <div className={styles.footerMain}>
                <div className={styles.footerGrid}>
                    {/* About Section */}
                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle}>Dental Implant Database</h3>
                        <p className={styles.footerDesc}>
                            A comprehensive professional database for dental implant systems, 
                            providing detailed information on leading brands and manufacturers worldwide.
                        </p>
                        <div className={styles.socialLinks}>
                            <a href="#" className={styles.socialIcon} aria-label="Facebook">
                                <span>📘</span>
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="Twitter">
                                <span>🐦</span>
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                                <span>💼</span>
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram">
                                <span>📷</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.footerColumn}>
                        <h4 className={styles.columnTitle}>Quick Links</h4>
                        <ul className={styles.footerLinks}>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/implants">Implant Database</Link></li>
                            <li><Link to="/blog">Blog & Resources</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className={styles.footerColumn}>
                        <h4 className={styles.columnTitle}>Resources</h4>
                        <ul className={styles.footerLinks}>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">Research Papers</a></li>
                            <li><a href="#">Clinical Guidelines</a></li>
                            <li><a href="#">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.footerColumn}>
                        <h4 className={styles.columnTitle}>Contact Information</h4>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📍</span>
                                <div>
                                    <strong>Address</strong>
                                    <p>Mae Fah Luang University<br/>Chiang Rai, Thailand</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>✉️</span>
                                <div>
                                    <strong>Email</strong>
                                    <p>mwiger@lamduan.mfu.com</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📞</span>
                                <div>
                                    <strong>Phone</strong>
                                    <p>+66 87 547-6401</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className={styles.footerBottom}>
                <div className={styles.footerBottomContent}>
                    <p className={styles.copyright}>
                        © {currentYear} Dental Implant Database. All rights reserved.
                    </p>
                    <div className={styles.legalLinks}>
                        <a href="#">Privacy Policy</a>
                        <span className={styles.divider}>|</span>
                        <a href="#">Terms of Service</a>
                        <span className={styles.divider}>|</span>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;