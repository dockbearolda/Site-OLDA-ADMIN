"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/lib/cart-context";
import { useCartDrawer } from "@/lib/cart-drawer-context";

import styles from "./cart-button.module.css";

function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function CartButton() {
  const { totalItems, items } = useCart();
  const { open } = useCartDrawer();
  const pathname = usePathname();

  if (items.length === 0) return null;

  const isInCatalogue = pathname?.startsWith("/catalogue");

  // Dans le catalogue : ouvre le drawer (masqué sur desktop ≥1280px
  // où le CartSidebar est déjà visible dans le CatalogShell)
  if (isInCatalogue) {
    return (
      <button
        className={`${styles.button} ${styles.buttonDrawer}`}
        onClick={open}
        aria-label="Ouvrir votre sélection"
      >
        <CartIcon />
        <span className={styles.label}>Ma sélection</span>
        <span className={styles.count}>{totalItems}</span>
      </button>
    );
  }

  // Hors catalogue : lien vers /commande
  return (
    <Link href="/commande" className={styles.button}>
      <CartIcon />
      <span className={styles.label}>Ma sélection</span>
      <span className={styles.count}>{totalItems}</span>
    </Link>
  );
}
