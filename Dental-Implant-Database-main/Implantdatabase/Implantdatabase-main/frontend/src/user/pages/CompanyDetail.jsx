// import React, { useMemo } from "react";
// import { Link, useParams } from "react-router-dom";
// import Breadcrumb from "../components/Breadcrumb";
// import styles from "./BrandDetail.module.css";
// import useMergedImplants from "../hooks/useMergedImplants";

// const normalizeCompany = (value) => String(value || "").trim().toLowerCase();

// const getBrandsByCompany = (implantsList, companyName) => {
//   const map = new Map();
//   const companyKey = normalizeCompany(companyName);

//   (implantsList || []).forEach((it) => {
//     const implantCompany = normalizeCompany(it.company);
//     if (!implantCompany || implantCompany !== companyKey) return;

//     const brand = String(it.brand || "").trim();
//     if (!brand) return;

//     if (!map.has(brand)) {
//       map.set(brand, {
//         brand,
//         company: it.company || companyName,
//         count: 0,
//         country: it.country || it.countryText || "—",
//       });
//     }

//     map.get(brand).count += 1;
//   });

//   return Array.from(map.values()).sort((a, b) =>
//     String(a.brand).localeCompare(String(b.brand))
//   );
// };

// export default function CompanyDetail() {
//   const { company } = useParams();
//   const decodedCompany = decodeURIComponent(company || "");
//   const { implants, loading } = useMergedImplants();

//   const brands = useMemo(
//     () => getBrandsByCompany(implants, decodedCompany),
//     [implants, decodedCompany]
//   );

//   const totalModels = useMemo(
//     () => brands.reduce((sum, item) => sum + item.count, 0),
//     [brands]
//   );

//   const logoSrc = `/company-logos/${decodedCompany.replace(/\s+/g, "_").toLowerCase()}.png`;

//   return (
//     <div className={styles.page}>
//       <Breadcrumb
//         items={[
//           { label: "Home", to: "/" },
//           { label: "Implants", to: "/implants" },
//           { label: decodedCompany },
//         ]}
//       />

//       <div className={styles.brandDetailContainer}>
//         <div className={styles.brandHeader}>
//           <div className={styles.brandLogoBox}>
//             <img
//               src={logoSrc}
//               alt={`${decodedCompany} logo`}
//               style={{
//                 width: 150,
//                 height: 150,
//                 objectFit: "contain",
//                 borderRadius: 20,
//                 background: "#f8fafc",
//                 border: "1px solid #dbeafe",
//               }}
//               onError={(e) => {
//                 e.currentTarget.style.display = "none";
//               }}
//             />
//             <div className={styles.brandLogoPlaceholder}>
//               <span>{decodedCompany}</span>
//             </div>
//           </div>

//           <div className={styles.brandInfo}>
//             <div>
//               <h1 className={styles.brandTitle}>{decodedCompany}</h1>
//               <p className={styles.brandCompany}>Browse brands under this company</p>
//             </div>

//             <div className={styles.brandMeta}>
//               <div className={styles.brandMetaCard}>
//                 <span className={styles.brandMetaLabel}>Brands</span>
//                 <div className={styles.brandMetaValue}>
//                   <span className={styles.brandMetaText}>{brands.length}</span>
//                 </div>
//               </div>

//               <div className={styles.brandMetaCard}>
//                 <span className={styles.brandMetaLabel}>Models</span>
//                 <div className={styles.brandMetaValue}>
//                   <span className={styles.brandMetaText}>{totalModels}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={styles.tabContent}>
//           <h2 className={styles.sectionTitle}>Brands</h2>

//           {loading ? (
//             <div className={styles.emptyState}>
//               <p>Loading brands…</p>
//             </div>
//           ) : brands.length === 0 ? (
//             <div className={styles.emptyState}>
//               <p>No brands are catalogued for this company yet.</p>
//             </div>
//           ) : (
//             <div className={styles.grid}>
//               {brands.map((item) => (
//                 <Link
//                   key={item.brand}
//                   to={`/implants/brand/${encodeURIComponent(item.brand)}`}
//                   className={styles.brandWebsite}
//                   style={{ display: "block", textDecoration: "none" }}
//                 >
//                   <div className={styles.brandMetaCard} style={{ minHeight: 120 }}>
//                     <span className={styles.brandMetaLabel}>{item.brand}</span>
//                     <div className={styles.brandMetaValue}>
//                       <span className={styles.brandMetaText}>
//                         {item.count} model{item.count !== 1 ? "s" : ""}
//                       </span>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }