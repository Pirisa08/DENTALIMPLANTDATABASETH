import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminManual } from "../services/api";
import styles from "./ManualReader.module.css";

export default function ManualReader({ admin = false, className = "", eyebrow, description }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const title = admin ? "Administrator Manual" : "User Manual";
  const source = pdfUrl;

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;
    const request = admin
      ? fetchAdminManual(controller.signal)
      : fetch(`${import.meta.env.BASE_URL}manuals/user-manual.pdf`, { signal: controller.signal })
        .then(response => {
          if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
            throw new Error("Unable to load the manual. Please try again.");
          }
          return response.blob();
        });
    request
      .then(blob => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err instanceof TypeError ? "Unable to connect. Please check your internet connection and try again." : err.message);
        }
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [admin, attempt]);

  return (
    <section className={`${styles.reader} ${className}`} aria-labelledby="manual-title" lang="en">
      {admin && (
        <Link to="/admin/dashboard" className={styles.back}>← Back to Dashboard</Link>
      )}
      <header className={styles.heading}>
        <div>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 id="manual-title">{title}</h1>
          <p>{description || "Implant Database Web Application"}</p>
        </div>
        {source && (
          <div className={styles.actions}>
            <a href={source} target="_blank" rel="noopener noreferrer">Open PDF in new tab</a>
            <a href={source} download={admin ? "admin-manual.pdf" : "user-manual.pdf"}>Download PDF</a>
          </div>
        )}
      </header>
      {error ? (
        <div className={styles.message} role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => { setError(""); setAttempt(value => value + 1); }}>Try again</button>
          {admin && <Link to="/admin/login">Sign in</Link>}
        </div>
      ) : source ? (
        <>
          <p className={styles.hint}>If the document does not display on your device, select “Open PDF in new tab” or “Download PDF”.</p>
          <iframe className={styles.document} src={source} title={title} />
        </>
      ) : (
        <p className={styles.message} role="status">Loading manual…</p>
      )}
    </section>
  );
}
