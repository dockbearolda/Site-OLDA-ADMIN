"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./material-segmented.module.css";

type MaterialSegment = {
  label: string;
  slug: string;
  icon: React.ReactNode;
};

const CERAMIC_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <ellipse cx="10" cy="13" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 13V9c0-2.2 3.1-4 7-4s7 1.8 7 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 7.5c1.2.6 2 1.5 2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const METAL_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 8h4M8 10h4M8 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M14 5l2-2M6 5L4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
  </svg>
);

const WOOD_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <ellipse cx="10" cy="10" rx="7" ry="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 5c0 3-3 5-3 5s3 2 3 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    <path d="M10 5c0 3 3 5 3 5s-3 2-3 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
  </svg>
);

const MATERIALS: MaterialSegment[] = [
  { label: "Céramique", slug: "tasse-ceramique", icon: CERAMIC_ICON },
  { label: "Métal",     slug: "tasse-metal",     icon: METAL_ICON },
  { label: "Bois",      slug: "autres-tasses",   icon: WOOD_ICON },
];

type Props = {
  familyId: string;
};

export function MaterialSegmented({ familyId }: Props) {
  const pathname = usePathname();

  return (
    <nav className={styles.wrapper} aria-label="Filtrer par matériau">
      <span className={styles.eyebrow}>Matériau</span>

      <div className={styles.track}>
        {MATERIALS.map(({ label, slug, icon }) => {
          const href = `/catalogue/${familyId}/${slug}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={slug}
              href={href}
              className={`${styles.segment} ${isActive ? styles.segmentActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.segmentIcon}>{icon}</span>
              <span className={styles.segmentLabel}>{label}</span>
              {isActive && <span className={styles.activePill} aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
