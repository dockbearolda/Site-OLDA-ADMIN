import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  getAllCatalogStaticParams,
  getCatalogSubfamilyData,
} from "@/lib/catalog-source";

import { SubfamilyView } from "./subfamily-view";
import styles from "./page.module.css";

type SubfamilyPageProps = {
  params: Promise<{
    family: string;
    subfamily: string;
  }>;
};

export async function generateStaticParams() {
  return getAllCatalogStaticParams();
}

export async function generateMetadata({
  params,
}: SubfamilyPageProps): Promise<Metadata> {
  const { family, subfamily } = await params;
  const entry = await getCatalogSubfamilyData(family, subfamily);
  if (!entry) return { title: "Catalogue" };
  return { title: entry.subfamily.name };
}

export default async function SubfamilyPage({ params }: SubfamilyPageProps) {
  const { family, subfamily } = await params;

  // Contexte prix : lu côté serveur depuis la session signée.
  // Ne transite jamais vers le client — les grilles tarifaires restent opaques.
  const session = await auth();
  const prixCtx = session?.user
    ? {
        userId: session.user.strapiId ? Number(session.user.strapiId) : undefined,
        groupeId: session.user.groupeId,
      }
    : undefined;

  const entry = await getCatalogSubfamilyData(family, subfamily, prixCtx);
  if (!entry) notFound();

  return (
    <div className={styles.content}>
      <SubfamilyView
        title={entry.subfamily.name}
        products={entry.subfamily.products}
      />
    </div>
  );
}
