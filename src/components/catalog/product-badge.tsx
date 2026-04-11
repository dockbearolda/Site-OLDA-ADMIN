import styles from "./product-badge.module.css";

export type BadgeType = "BEST-SELLER" | "NOUVEAU";

/**
 * Aucune logique hardcodée — les badges sont pilotés exclusivement
 * par le champ `badge` renvoyé par l'API admin (Strapi/CMS).
 * getProductBadge() est conservée pour rétrocompatibilité mais
 * retourne toujours null jusqu'à branchement API.
 */
export function getProductBadge(_ref: string): BadgeType | null {
  return null;
}

export function ProductBadge({ type }: { type: BadgeType }) {
  return (
    <span className={`${styles.badge} ${type === "BEST-SELLER" ? styles.bestSeller : styles.nouveau}`}>
      {type}
    </span>
  );
}
