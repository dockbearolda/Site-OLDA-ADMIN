"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/lib/cart-context";
import type { Commande } from "@/lib/strapi";
import styles from "./page.module.css";

const STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  expediee: "Expédiée",
  annulee: "Annulée",
};

const STATUT_COLOR: Record<string, string> = {
  en_attente: styles.statutPending,
  confirmee: styles.statutConfirmed,
  expediee: styles.statutShipped,
  annulee: styles.statutCancelled,
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtEur(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default function MesCommandesPage() {
  const router = useRouter();
  const { add, clear } = useCart();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/mon-compte/commandes")
      .then((r) => r.json())
      .then((data: { commandes?: Commande[]; error?: string }) => {
        if (data.error) setError(data.error);
        else setCommandes(data.commandes ?? []);
      })
      .catch(() => setError("Erreur de chargement des commandes."))
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = useCallback(
    (commande: Commande) => {
      clear();
      commande.items.forEach((item) => {
        add(item.ref, item.label, item.quantity, item.prixAchat, item.prixRevente);
      });
      router.push("/commande");
    },
    [add, clear, router],
  );

  if (loading) {
    return (
      <div className={styles.state}>
        <span className={styles.spinner} />
        <p>Chargement de vos commandes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state}>
        <p className={styles.errorText}>{error}</p>
        <p className={styles.errorSub}>
          Vérifiez que la collection &ldquo;commande&rdquo; est créée dans votre Strapi.
        </p>
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className={styles.state}>
        <h1 className={styles.title}>Mes commandes</h1>
        <p className={styles.emptyText}>Vous n&apos;avez pas encore de commande.</p>
        <a href="/catalogue" className={styles.ctaLink}>Parcourir le catalogue →</a>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mes commandes</h1>
      <p className={styles.count}>{commandes.length} commande{commandes.length > 1 ? "s" : ""}</p>

      <div className={styles.list}>
        {commandes.map((cmd) => {
          const isOpen = expanded === cmd.id;
          const hasMarge = cmd.marge_projetee > 0;

          return (
            <article key={cmd.id} className={styles.card}>
              {/* En-tête */}
              <button
                className={styles.cardHeader}
                onClick={() => setExpanded(isOpen ? null : cmd.id)}
                aria-expanded={isOpen}
              >
                <div className={styles.cardLeft}>
                  <span className={styles.cardRef}>{cmd.reference}</span>
                  <span className={styles.cardDate}>{fmtDate(cmd.createdAt)}</span>
                </div>
                <div className={styles.cardRight}>
                  <span className={`${styles.statut} ${STATUT_COLOR[cmd.statut] ?? ""}`}>
                    {STATUT_LABEL[cmd.statut] ?? cmd.statut}
                  </span>
                  <span className={styles.cardCount}>{cmd.items.length} réf.</span>
                  {cmd.total_achat_ht > 0 && (
                    <span className={styles.cardTotal}>{fmtEur(cmd.total_achat_ht)}</span>
                  )}
                  <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Détail */}
              {isOpen && (
                <div className={styles.cardBody}>
                  {/* Métriques financières */}
                  {hasMarge && (
                    <div className={styles.marginRow}>
                      <div className={styles.marginMetric}>
                        <span className={styles.marginValue}>{fmtEur(cmd.total_achat_ht)}</span>
                        <span className={styles.marginLabel}>Investi B2B</span>
                      </div>
                      <div className={styles.marginMetric}>
                        <span className={styles.marginValue}>{fmtEur(cmd.total_revente)}</span>
                        <span className={styles.marginLabel}>CA Potentiel</span>
                      </div>
                      <div className={`${styles.marginMetric} ${styles.marginHero}`}>
                        <span className={styles.marginHeroValue}>+{fmtEur(cmd.marge_projetee)}</span>
                        <span className={styles.marginLabel}>Bénéfice projeté</span>
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Réf.</th>
                        <th>Désignation</th>
                        <th>Qté</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cmd.items.map((item) => (
                        <tr key={item.ref}>
                          <td className={styles.tdRef}>{item.ref}</td>
                          <td>{item.label}</td>
                          <td className={styles.tdQty}>× {item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Bouton Re-commander */}
                  <button
                    className={styles.reorderBtn}
                    onClick={() => handleReorder(cmd)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-4.08" />
                    </svg>
                    Re-commander à l&apos;identique
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
