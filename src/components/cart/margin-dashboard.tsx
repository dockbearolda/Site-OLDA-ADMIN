"use client";

import { useCart } from "@/lib/cart-context";
import styles from "./margin-dashboard.module.css";

function fmt(n: number): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

export function MarginDashboard({ vertical = false }: { vertical?: boolean }) {
  const { hasPrices, totalB2B, totalRevente, margeNette, tauxMarge } = useCart();

  if (!hasPrices) return null;

  const isPositive = margeNette >= 0;

  return (
    <div className={styles.dashboard}>
      <p className={styles.label}>Tableau de rentabilité</p>

      <div className={`${styles.metrics} ${vertical ? styles.metricsVertical : ""}`}>
        {/* Investissement B2B */}
        <div className={styles.metric}>
          <span className={styles.metricValue}>{fmt(totalB2B)}</span>
          <span className={styles.metricName}>Investissement B2B</span>
          <span className={styles.metricSub}>coût total de votre commande</span>
        </div>

        {/* Séparateur flèche */}
        <div className={styles.arrow} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* CA Potentiel */}
        <div className={styles.metric}>
          <span className={styles.metricValue}>{fmt(totalRevente)}</span>
          <span className={styles.metricName}>CA Potentiel</span>
          <span className={styles.metricSub}>chiffre d&apos;affaires à la revente</span>
        </div>

        {/* Séparateur flèche */}
        <div className={styles.arrow} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Marge Nette — carte héro */}
        <div className={`${styles.metric} ${styles.metricHero}`}>
          <span className={styles.heroValue}>
            {isPositive ? "+" : ""}{fmt(margeNette)}
          </span>
          <span className={styles.heroName}>Bénéfice net projeté</span>
          <span className={styles.heroBadge}>
            {isPositive ? "+" : ""}{tauxMarge.toFixed(1)}% de marge
          </span>
        </div>
      </div>
    </div>
  );
}
