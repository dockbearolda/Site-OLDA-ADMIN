import styles from "./product-badge.module.css";

export type BadgeType = "BEST-SELLER";

const BESTSELLER_REFS = ["TC 01", "TC 06", "GD 01", "PCP 01", "TM 01", "MP 01"];
const BESTSELLER_PREFIXES = ["TCF"];

export function getProductBadge(ref: string): BadgeType | null {
  const trimmed = ref.trim();
  if (BESTSELLER_PREFIXES.some((p) => trimmed.startsWith(p))) return "BEST-SELLER";
  if (BESTSELLER_REFS.includes(trimmed)) return "BEST-SELLER";
  return null;
}

export function ProductBadge({ type }: { type: BadgeType }) {
  return (
    <span className={`${styles.badge} ${styles.bestSeller}`}>
      {type}
    </span>
  );
}
