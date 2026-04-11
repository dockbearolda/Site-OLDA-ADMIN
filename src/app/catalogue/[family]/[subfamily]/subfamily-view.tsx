"use client";

import { useState, useEffect } from "react";

import { ProductGrid } from "@/components/catalog/product-grid";
import type { CatalogProduct } from "@/data/catalog";

type Props = {
  title: string;
  products: readonly CatalogProduct[];
};

export function SubfamilyView({ title, products }: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const applyViewMode = () => {
      setViewMode(window.innerWidth < 980 ? "list" : "grid");
    };
    applyViewMode();
    window.addEventListener("resize", applyViewMode);
    return () => window.removeEventListener("resize", applyViewMode);
  }, []);

  return (
    <ProductGrid
      products={products}
      title={title}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}
