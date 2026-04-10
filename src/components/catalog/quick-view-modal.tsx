"use client";

import { useEffect } from "react";
import Image from "next/image";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import type { CatalogProduct } from "@/data/catalog";
import { getProductImagePath } from "@/lib/product-image";

import styles from "./quick-view-modal.module.css";

type Props = {
  product: CatalogProduct;
  onClose: () => void;
};

export function QuickViewModal({ product, onClose }: Props) {
  const src = getProductImagePath(product.ref);
  const meta = [
    product.note1,
    product.note2,
    product.moq && product.moq > 1 ? `Min. de commande : ${product.moq}` : null,
  ].filter(Boolean) as string[];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.label}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.imageArea}>
          {src ? (
            <Image
              src={src}
              alt={product.label}
              fill
              sizes="480px"
              className={styles.image}
              priority
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>{product.ref}</span>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <span className={styles.ref}>{product.ref}</span>
          <h2 className={styles.name}>{product.label}</h2>

          {meta.length > 0 && (
            <div className={styles.notes}>
              {meta.map((tag) => (
                <span key={tag} className={styles.note}>{tag}</span>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <AddToCartButton productRef={product.ref} productLabel={product.label} />
          </div>
        </div>
      </div>
    </div>
  );
}
