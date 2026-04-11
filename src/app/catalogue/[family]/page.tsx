import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import {
  getAllCatalogStaticParams,
  getCatalogFamilyData,
  slugifyLabel,
} from "@/lib/catalog-source";

import styles from "./page.module.css";

type FamilyPageProps = {
  params: Promise<{
    family: string;
  }>;
};

export async function generateStaticParams() {
  const params = await getAllCatalogStaticParams();
  const seen = new Set<string>();
  return params.filter((p) => {
    if (seen.has(p.family)) return false;
    seen.add(p.family);
    return true;
  });
}

export async function generateMetadata({
  params,
}: FamilyPageProps): Promise<Metadata> {
  const { family } = await params;
  const familyData = await getCatalogFamilyData(family);

  if (!familyData) {
    return {
      title: "Catalogue",
    };
  }

  return {
    title: familyData.name,
  };
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { family } = await params;
  const familyData = await getCatalogFamilyData(family);

  if (!familyData) {
    notFound();
  }

  // Sur mobile (iPhone / Android phone), aller directement à la première sous-famille
  const hdrs = await headers();
  const ua = hdrs.get("user-agent") ?? "";
  const isMobilePhone = /iPhone|Android.*Mobile|Mobile.*Android/i.test(ua);
  if (isMobilePhone && familyData.subfamilies.length > 0) {
    redirect(`/catalogue/${family}/${slugifyLabel(familyData.subfamilies[0].name)}`);
  }

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1 className={styles.title}>{familyData.name}</h1>
      </header>

      <section className={styles.section}>
        <div className={styles.subfamilyGrid}>
          {familyData.subfamilies.map((subfamily) => (
            <Link
              key={subfamily.name}
              className={styles.subfamilyCard}
              href={`/catalogue/${familyData.id}/${slugifyLabel(subfamily.name)}`}
            >
              <MediaPlaceholder ratio="square" label={subfamily.name} />
              <h3 className={styles.subfamilyName}>{subfamily.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
