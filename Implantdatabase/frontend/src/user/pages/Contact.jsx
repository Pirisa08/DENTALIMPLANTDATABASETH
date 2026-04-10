import React, { useState } from 'react';
import styles from './Contact.module.css';
import { feedbackAPI } from '../../services/api.js';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus({ type: '', message: '' });

        try {
            const saved = await feedbackAPI.submit(formData);
            setFormData({ name: '', email: '', subject: '', message: '' });
            if (saved?.isLocal) {
                setFormStatus({
                    type: 'offline',
                    message: 'Your message is saved locally and will send once the connection is back.',
                });
            } else {
                setFormStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
            }
            setTimeout(() => {
                setFormStatus({ type: '', message: '' });
            }, 3500);
        } catch (err) {
            setFormStatus({
                type: 'error',
                message: 'We could not send your message right now. Please try again in a moment.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1>Get in Touch</h1>
                <p className={styles.headerSubtitle}>
                    We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
            </div>
            
            <section className={styles.contactContent}>
                <div className={styles.contentGrid}>
                    {/* Contact Information */}
                    <div className={styles.infoSection}>
                        <h2 className={styles.sectionTitle}>Contact Information</h2>
                        <p className={styles.infoDescription}>
                            Fill out the form and our team will get back to you within 24 hours.
                        </p>

                        <div className={styles.contactInfoList}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon} aria-hidden="true">📍</div>
                                <div className={styles.infoContent}>
                                    <h3>Address</h3>
                                    <p>Mae Fah Luang University<br/>333 Moo 1, Thasud, Muang<br/>Chiang Rai 57100, Thailand</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon} aria-hidden="true">✉️</div>
                                <div className={styles.infoContent}>
                                    <h3>Email</h3>
                                    <p><a href="mailto:mwiger@lamduan.mfu.com">mwiger@lamduan.mfu.com</a><br/><a href="mailto:support@dentaldb.com">support@dentaldb.com</a></p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon} aria-hidden="true">☎️</div>
                                <div className={styles.infoContent}>
                                    <h3>Phone</h3>
                                    <p><a href="tel:+66875476401">+66 87 547-6401</a><br/>Mon-Fri, 8:00 AM - 4:00 PM (ICT)</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon} aria-hidden="true">⏰</div>
                                <div className={styles.infoContent}>
                                    <h3>Working Hours</h3>
                                    <p>Monday - Friday: 8:00 AM - 4:00 PM<br/>Saturday - Sunday: Closed</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.socialLinks}>
                            <h3>Follow Us</h3>
                            <div className={styles.socialIcons}>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Facebook">📘</a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Twitter">🐦</a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="LinkedIn">💼</a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Instagram">📷</a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className={styles.formSection}>
                        <form onSubmit={handleSubmit} className={styles.contactForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name" className={styles.formLabel}>
                                        Full Name <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.formLabel}>
                                        Email Address <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject" className={styles.formLabel}>
                                    Subject <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="data">Data Submission</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="partnership">Partnership Opportunity</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message" className={styles.formLabel}>
                                    Message <span className={styles.required}>*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={styles.formTextarea}
                                    placeholder="Write your message here..."
                                    rows="6"
                                    required
                                ></textarea>
                            </div>

                            {formStatus.message && (
                                <div
                                    className={`${styles.formAlert} ${formStatus.type === 'error' ? styles.formAlertError : formStatus.type === 'offline' ? styles.formAlertOffline : styles.formAlertSuccess}`}
                                    role="status"
                                >
                                    {formStatus.type === 'error' ? '⚠️ ' : formStatus.type === 'offline' ? '⏳ ' : '✓ '}
                                    {formStatus.message}
                                </div>
                            )}

                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                                <span className={styles.submitIcon}>→</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Additional Information */}
                <div className={styles.additionalInfo}>
                    <div className={styles.infoCard}>
                        <div className={styles.cardIcon}>💡</div>
                        <h3>Quick Response</h3>
                        <p>We typically respond within 24 hours during business days</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.cardIcon}>🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your information is encrypted and never shared with third parties</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.cardIcon}>🌍</div>
                        <h3>Global Support</h3>
                        <p>Supporting dental professionals worldwide with comprehensive data</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;