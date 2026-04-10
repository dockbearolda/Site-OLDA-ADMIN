"use client";

import { useEffect } from "react";
import { useCartDrawer } from "@/lib/cart-drawer-context";
import { CartSidebarContent } from "./cart-sidebar";
import styles from "./cart-drawer.module.css";

export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();

  /* Verrouille le scroll du body quand le drawer est ouvert */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Ferme avec Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Votre sélection"
      >
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Votre sélection</span>
          <button className={styles.closeBtn} onClick={close} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.panelBody}>
          <CartSidebarContent onValidate={close} />
        </div>
      </div>
    </>
  );
}
