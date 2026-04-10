"use client";

import { useState } from "react";

import { ProductGrid } from "@/components/catalog/product-grid";
import type { CatalogProduct } from "@/data/catalog";

import styles from "./page.module.css";

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="1" y1="4" x2="15" y2="4" />
      <line x1="1" y1="8" x2="15" y2="8" />
      <line x1="1" y1="12" x2="15" y2="12" />
    </svg>
  );
}

type Props = {
  title: string;
  products: readonly CatalogProduct[];
};

export function SubfamilyView({ title, products }: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.viewToggle} role="group" aria-label="Mode d'affichage">
          <button
            className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Vue grille"
            aria-pressed={viewMode === "grid"}
            title="Vue grille"
          >
            <GridIcon />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="Vue liste"
            aria-pressed={viewMode === "list"}
            title="Vue liste dense"
          >
            <ListIcon />
          </button>
        </div>
      </header>

      <section className={styles.section}>
        <ProductGrid products={products} viewMode={viewMode} />
      </section>
    </>
  );
}
