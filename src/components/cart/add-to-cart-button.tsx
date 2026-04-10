"use client";

import { useCallback, useState } from "react";

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

import styles from "./add-to-cart-button.module.css";

/**
 * Retourne le minimum de commande (MOQ) d'un produit à partir de sa référence.
 * Calculé côté client pour rester indépendant du cache serveur.
 */
function getProductMOQ(ref: string): number {
  // Tasses Céramique (TC xx / TCF xx)
  if (/^TCF?\s/.test(ref)) return 3;
  // Porte Sac
  if (ref === "PS 01") return 3;
  // Goodies : Porte-Clés, Magnets, Stickers
  if (/^(PCP|PCB|PCA|PCFL|MP|MB|MA|STI)\s/.test(ref)) return 10;
  // Crayon papier bois
  if (/^CPB\s/.test(ref)) return 10;
  return 1;
}

type AddToCartButtonProps = {
  productRef: string;
  productLabel: string;
  productPrixAchat?: number;
  productPrixRevente?: number;
};

export function AddToCartButton({
  productRef,
  productLabel,
  productPrixAchat,
  productPrixRevente,
}: AddToCartButtonProps) {
  const moq = getProductMOQ(productRef);
  const { add, items, updateQuantity, remove } = useCart();
  const { toast } = useToast();
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

  /* — Produit déjà dans le panier (et animation terminée) — */
  if (inCart && phase === "idle") {
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
        <div className={styles.quickAdd}>
          {quickSteps.map((step) => (
            <button key={step} className={styles.quickAddBtn} onClick={() => handleQuickAdd(step)}>
              +{step}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* — Produit pas encore dans le panier — */
  return (
    <div className={styles.addBlock}>
      <div className={styles.pendingRow}>
        <button
          className={styles.qtyBtn}
          aria-label="Diminuer"
          onClick={() => setPendingQty((q) => Math.max(moq, q - moq))}
        >
          −
        </button>
        <span className={styles.qtyValue}>{pendingQty}</span>
        <button
          className={styles.qtyBtn}
          aria-label="Augmenter"
          onClick={() => setPendingQty((q) => q + moq)}
        >
          +
        </button>
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
        {phase === "idle" && "Ajouter"}
      </button>
    </div>
  );
}
