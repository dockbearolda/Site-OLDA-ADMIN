import type { Metadata } from "next";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Catalogue",
};

export default function CataloguePage() {
  return (
    <div className={styles.content} />
  );
}
