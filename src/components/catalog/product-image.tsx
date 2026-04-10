"use client";

import { useState } from "react";
import Image from "next/image";

import { PremiumPlaceholder } from "@/components/ui/premium-placeholder";

type ProductImageProps = {
  src: string;
  alt: string;
  className: string;
};

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <PremiumPlaceholder />;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
