"use client";

import { useCallback, useState } from "react";

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

import styles from "./add-to-cart-button.module.css";

type AddToCartButtonProps = {
  productRef: string;
  productLabel: string;
  productPrixAchat?: number;
  productPrixRevente?: number;
  /** Minimum de commande — lu depuis catalog.ts, pas hardcodé */
  moq?: number;
  /** Palier des boutons +/− (= moq si non spécifié) */
  step?: number;
};

export function AddToCartButton({
  productRef,
  productLabel,
  productPrixAchat,
  productPrixRevente,
  moq = 1,
  step,
}: AddToCartButtonProps) {
  const { add, items, updateQuantity, remove } = useCart();
  const { toast } = useToast();
  const increment = step ?? moq;
  const [pendingQty, setPendingQty] = useState(moq);
  const [phase, setPhase] = useState<"idle" | "loading" | "added">("idle");

  const inCart = items.find((i) => i.ref === productRef);

  const handleAdd = useCallback(() => {
    setPhase("loading");
    setTimeout(() => {
      add(productRef, productLabel, pendingQty, productPrixAchat, productPrixRevente);
      toast(`${pendingQty}× ${productLabel} ajouté`);
      setPhase("added");
      setTimeout(() => setPhase("idle"), 1500);
    }, 300);
  }, [add, toast, productRef, productLabel, pendingQty, productPrixAchat, productPrixRevente]);

  const handleQuickAdd = useCallback(
    (qty: number) => {
      updateQuantity(productRef, (inCart?.quantity ?? 0) + qty);
      toast(`+${qty} ${productLabel}`);
    },
    [updateQuantity, toast, productRef, productLabel, inCart],
  );

  // Raccourcis d'ajout rapide adaptés au MOQ
  const quickSteps = moq === 1 ? [5, 10, 25] : [moq, moq * 3, moq * 5];

  if (inCart && phase === "idle") {
    const gain = productPrixAchat && productPrixRevente ? (productPrixRevente - productPrixAchat) * inCart.quantity : null;
    return (
      <div className={styles.cartBlock}>
        <div className={styles.quantityRow}>
          <button
            className={styles.qtyBtn}
            aria-label="Diminuer la quantité"
            onClick={() =>
              inCart.quantity <= moq
                ? remove(productRef)
                : updateQuantity(productRef, inCart.quantity - moq)
            }
          >
            {inCart.quantity <= moq ? "✕" : "−"}
          </button>
          <span className={styles.qtyValue}>{inCart.quantity}</span>
          <button
            className={styles.qtyBtn}
            aria-label="Augmenter la quantité"
            onClick={() => updateQuantity(productRef, inCart.quantity + moq)}
          >
            +
          </button>
        </div>
        {gain !== null && (
          <div className={styles.gainSummary}>
            Marge estimée&nbsp;: <span className={styles.gainAmount}>+{gain.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}&nbsp;€</span>
          </div>
        )}
        <div className={styles.quickAdd}>
          {quickSteps.map((s) => (
            <button key={s} className={styles.quickAddBtn} onClick={() => handleQuickAdd(s)}>
              +{s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const pendingGain = productPrixAchat && productPrixRevente ? (productPrixRevente - productPrixAchat) * pendingQty : null;
  const margeUnitaire = productPrixAchat && productPrixRevente ? (productPrixRevente - productPrixAchat) : null;

  /* — Produit pas encore dans le panier — */
  return (
    <div className={styles.addBlock}>
      {moq > 1 && (
        <div className={styles.moqBadge}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Min.&nbsp;{moq}&nbsp;unités
        </div>
      )}
      {margeUnitaire !== null && (
        <div className={styles.gainSummary}>
          Marge unitaire&nbsp;: <span className={styles.gainAmount}>+{margeUnitaire.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}&nbsp;€</span>
        </div>
      )}
      <div className={styles.controlRow}>
        <div className={styles.pendingRow}>
          <button
            className={styles.qtyBtn}
            aria-label="Diminuer"
            onClick={() => setPendingQty((q) => Math.max(moq, q - increment))}
          >
            −
          </button>
          <span className={styles.qtyValue}>{pendingQty}</span>
          <button
            className={styles.qtyBtn}
            aria-label="Augmenter"
            onClick={() => setPendingQty((q) => q + increment)}
          >
            +
          </button>
        </div>
        {pendingGain !== null && (
          <div className={styles.gainSummary}>
            Marge estimée&nbsp;: <span className={styles.gainAmount}>+{pendingGain.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}&nbsp;€</span>
          </div>
        )}
      </div>

      <button
        className={[
          styles.button,
          phase === "loading" ? styles.buttonLoading : "",
          phase === "added" ? styles.buttonAdded : "",
        ].filter(Boolean).join(" ")}
        onClick={handleAdd}
        disabled={phase !== "idle"}
      >
        {phase === "loading" && (
          <span className={styles.spinner} aria-hidden="true" />
        )}
        {phase === "added" && (
          <>
            <svg className={styles.checkIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2.5 8.5 6.5 12.5 13.5 4.5" />
            </svg>
            Ajouté ✓
          </>
        )}
        {phase === "idle" && "Ajouter au panier"}
      </button>
    </div>
  );
}
