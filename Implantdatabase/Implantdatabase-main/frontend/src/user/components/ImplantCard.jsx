import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ImplantCard.module.css';

const ImplantCard = ({ title, company, image, slug }) => {
    const hasImage = Boolean(image);
    const companyName = typeof company === 'string'
        ? company
        : (company && (company.name || company.title || company.label)) || '';
    const safeTitle = title || 'Untitled Implant';

    return (
        <Link to={`/implants/${slug}`} className={styles.implantCard}>
            <div className={styles.cardVisual}>
                {hasImage ? (
                    <img src={image} alt={safeTitle} className={styles.cardImage} />
                ) : (
                    <div className={styles.placeholderGroup}>
                        <span className={styles.placeholderIcon} aria-hidden="true">🦷</span>
                        <span className={styles.placeholderLabel}>{safeTitle}</span>
                    </div>
                )}
            </div>
            <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{safeTitle}</h3>
                <p className={styles.cardCompany}>{companyName || '—'}</p>
            </div>
        </Link>
    );
};

export default ImplantCard;