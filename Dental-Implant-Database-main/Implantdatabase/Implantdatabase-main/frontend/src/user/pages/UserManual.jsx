import Breadcrumb from "../components/Breadcrumb";
import ManualReader from "../../components/ManualReader";
import styles from "./UserManual.module.css";

export default function UserManual() {
  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "User Manual" }]} />
      <div className={styles.content}>
        <ManualReader
          className={styles.manual}
          eyebrow="Help & documentation"
          description="Get to know the Implant Database. Read the guide below, or download a copy to keep for reference."
        />
      </div>
    </div>
  );
}
