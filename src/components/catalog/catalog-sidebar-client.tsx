"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { slugifyLabel } from "@/data/catalog";
import type { CatalogFamily } from "@/data/catalog";

import styles from "./catalog-sidebar.module.css";

function getFamilyIcon(familyId: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    goodies: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2a1 1 0 0 1 1 1v2h4V3a1 1 0 0 1 2 0v2h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1z" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
    tasses: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="2" y2="4" />
        <line x1="10" x2="10" y1="2" y2="4" />
        <line x1="14" x2="14" y1="2" y2="4" />
      </svg>
    ),
    accessoires: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    textiles: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
    "offres-speciales": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };
  return icons[familyId] || "•";
}

type Props = {
  families: CatalogFamily[];
  isAdmin?: boolean;
};

/**
 * Sidebar de navigation catalogue — Client Component.
 * Reçoit les données familles du Layout serveur parent et dérive
 * l'état actif depuis usePathname() pour ne jamais avoir besoin
 * d'être démonté/remonté lors des navigations entre pages catalogue.
 */
export function CatalogSidebarClient({ families, isAdmin }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // /catalogue → ["catalogue"]
  // /catalogue/goodies → ["catalogue", "goodies"]
  // /catalogue/goodies/stylos → ["catalogue", "goodies", "stylos"]
  const segments = pathname.split("/").filter(Boolean);
  const activeRoot = segments.length === 1 && segments[0] === "catalogue";
  const activeFamilyId = segments.length >= 2 ? segments[1] : undefined;
  const activeSubfamilySlug = segments.length >= 3 ? segments[2] : undefined;
  const activeFamily = activeFamilyId ? families.find((f) => f.id === activeFamilyId) : undefined;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.panel}>
        {/*
         * mobileBar — wrapper transparent sur desktop (display:contents),
         * devient une barre flex 3 colonnes sur mobile :
         * [slot panier | logo centré | slot fantôme]
         */}
        <div className={styles.mobileBar}>
          {/* Slot gauche — fantôme pour équilibrer le centrage du logo */}
          <div className={styles.mobileBarSlot} aria-hidden="true" />

          {/* Logo — centré */}
          <Link href="/" className={styles.logoLink} aria-label="Accueil OLDA">
            <svg
              className={styles.logoMark}
              viewBox="60 65 165 180"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M187.85,114.63h33.12c.82,0,1.48.66,1.48,1.48v34.05c0,.82-.66,1.48-1.48,1.48h-73.22c-.82,0-1.48-.66-1.48-1.48v-76.52c0-.82.66-1.48,1.48-1.48h37.15c.82,0,1.48.66,1.48,1.48v39.51c0,.82.66,1.48,1.48,1.48Z" />
              <path d="M141.24,238.96l41.28-77.18c.58-1.05,2.09-1.05,2.67,0l41.39,77.18c.56,1.02-.18,2.26-1.34,2.26h-82.67c-1.16,0-1.89-1.24-1.34-2.26Z" />
              <path d="M101.44,161.74h-2.56l.48,79.48h1.16c20.68,0,38.61-15.44,40.49-36.03,2.14-23.57-16.43-43.44-39.57-43.44Z" />
              <path d="M95.36,161.74h-32.71c-.82,0-1.48.66-1.48,1.48v76.52c0,.82.66,1.48,1.48,1.48h32.26l.45-79.48Z" />
              <path d="M140.12,108.5c-1.61-20.24-18-36.63-38.24-38.24-25.72-2.04-47.09,19.32-45.05,45.04,1.6,20.24,18,36.64,38.24,38.25.12,0,.23,0,.34.02l.23-39.79v-.05l-11.32,11.07s-1.19-11.25,6.13-12.84h-13s4.12-7.32,14.54-4.85l-7.67-7.67s11.86-1.72,12.82,6.62c1.07-8.9,12.54-6.48,12.54-6.48l-7.92,8.04c8.81-3.63,14.91,4.33,14.91,4.33h-13.05c4.85,1.4,6.01,6.08,6.2,9.41.14,2.05-.12,3.59-.12,3.59l-3.54-3.59-7.55-7.62.24,39.91c24-.2,43.23-20.71,41.29-45.17Z" />
            </svg>
          </Link>

          {/* Slot droit — fantôme pour équilibrer le centrage du logo */}
          <div className={styles.mobileBarSlot} aria-hidden="true" />
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className={styles.adminBtn}
            title="Panneau d'administration"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Administration
          </Link>
        )}

        {/* Mobile-only nav: native iOS <select> — remplace la double rangée de pills */}
        <select
          className={styles.mobileSelect}
          value={
            activeFamilyId && activeSubfamilySlug
              ? `${activeFamilyId}/${activeSubfamilySlug}`
              : activeFamilyId ?? ""
          }
          onChange={(e) => {
            if (e.target.value) router.push(`/catalogue/${e.target.value}`);
          }}
          aria-label="Choisir une catégorie"
        >
          <option value="" disabled>Choisir une catégorie…</option>
          {families.map((family) => (
            <optgroup key={family.id} label={family.name}>
              {family.subfamilies.map((sub) => {
                const subSlug = slugifyLabel(sub.name);
                return (
                  <option key={subSlug} value={`${family.id}/${subSlug}`}>
                    {sub.name}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>

        {/* Mobile-only pill nav (legacy — gardé caché, utilisé uniquement sur desktop) */}
        <div className={styles.mobileNav} aria-hidden="true" style={{ display: "none" }} />

        <nav className={styles.nav}>
          {families.map((family) => (
            <div key={family.id} className={styles.navGroup}>
              <span
                className={`${styles.familyLabel} ${
                  activeFamilyId === family.id ? styles.activeFamily : ""
                }`.trim()}
              >
                <span className={styles.icon}>{getFamilyIcon(family.id)}</span>
                {family.name}
              </span>

              <div className={styles.subLinks}>
                {family.subfamilies.map((subfamily) => (
                  <Link
                    key={`${family.id}-${subfamily.name}`}
                    className={`${styles.subLink} ${
                      activeFamilyId === family.id &&
                      activeSubfamilySlug === slugifyLabel(subfamily.name)
                        ? styles.activeSubLink
                        : ""
                    }`.trim()}
                    href={`/catalogue/${family.id}/${slugifyLabel(subfamily.name)}`}
                  >
                    {subfamily.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
