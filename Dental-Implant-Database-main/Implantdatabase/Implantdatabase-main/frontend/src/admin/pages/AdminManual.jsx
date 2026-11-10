import ManualReader from "../../components/ManualReader";
import styles from "./AdminManual.module.css";

export default function AdminManual() {
  return (
    <ManualReader
      admin
      className={styles.manual}
      eyebrow="Administration guide"
      description="Your reference for managing the Implant Database. Read online or save a copy for later."
    />
  );
}
