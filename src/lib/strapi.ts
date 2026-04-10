/**
 * Strapi v5 API client
 *
 * Variables d'environnement :
 *   NEXT_PUBLIC_STRAPI_URL  — URL publique (utilisée aussi côté client pour l'auth)
 *   STRAPI_API_TOKEN        — token API admin (JAMAIS préfixé NEXT_PUBLIC_)
 *
 * Content-Types Strapi :
 *   famille       (titre, slug, strapline, resume, accent, surface, signaux_business, ordre, en_ligne)
 *   categorie     (titre, slug, ordre, en_ligne, → famille)
 *   produit       (reference, designation, note1, note2, moq, stock, en_ligne,
 *                  prix_public, prix_revendeur, → image, → categorie, → prix_overrides)
 *   groupe_client (nom, slug, description, → users, → prix_overrides)
 *   prix_override (prix_achat, prix_revente, moq, → produit, → groupe, user_id)
 *   commande      (reference, statut, client_*, items, totaux, strapi_user_id)
 */

import type { CatalogFamily, CatalogProduct, CatalogSubfamily } from "@/data/catalog";
import { slugifyLabel } from "@/data/catalog";

const STRAPI_URL = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "").replace(/\/$/, "");
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

export function isStrapiConfigured(): boolean {
  return STRAPI_URL.length > 0;
}

// ── Low-level fetch ──────────────────────────────────────────────

async function strapiGet<T>(path: string, options?: { revalidate?: number }): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: options?.revalidate ?? 60 },
  });

  if (!res.ok) {
    throw new Error(`[strapi] ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

async function strapiPost<T>(path: string, data: unknown): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[strapi] POST ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

async function strapiPatch<T>(path: string, data: unknown): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[strapi] PUT ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

// ── Strapi v5 response shapes ────────────────────────────────────

type StrapiList<T> = {
  data: T[];
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number };
  };
};

type StrapiImageFormat = {
  url: string;
  width: number;
  height: number;
};

type StrapiImageRaw = {
  id: number;
  url: string;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
};

type StrapiPrixOverrideRaw = {
  id: number;
  prix_achat: number;
  prix_revente: number | null;
  moq: number | null;
  user_id: number | null;
  groupe: { id: number; slug: string } | null;
};

type StrapiProduitRaw = {
  id: number;
  documentId: string;
  reference: string;
  designation: string;
  note1: string | null;
  note2: string | null;
  moq: number | null;
  stock: number | null;
  en_ligne: boolean;
  prix_public: number | null;
  prix_revendeur: number | null;
  image: StrapiImageRaw | null;
  prix_overrides: StrapiPrixOverrideRaw[] | null;
};

type StrapicategorieRaw = {
  id: number;
  documentId: string;
  titre: string;
  slug: string;
  ordre: number;
  en_ligne: boolean;
};

type StrapiFamilleRaw = {
  id: number;
  documentId: string;
  titre: string;
  slug: string;
  strapline: string | null;
  resume: string | null;
  accent: string | null;
  surface: string | null;
  signaux_business: string[] | null;
  ordre: number;
  en_ligne: boolean;
  categories: StrapicategorieRaw[] | null;
};

// ── Prix resolution ──────────────────────────────────────────────

export type PrixContext = {
  /** strapiId du client connecté (number) — undefined si non connecté */
  userId?: number;
  /** id du groupe_client Strapi — undefined si pas de groupe */
  groupeId?: number;
};

export type PrixResolu = {
  achat: number | null;
  revente: number | null;
  moq: number;
  source: "individuel" | "groupe" | "catalogue" | "aucun";
};

/**
 * Waterfall de résolution du prix B2B :
 * 1. Override individuel (user_id = client)
 * 2. Override de groupe (groupe.id = groupeId)
 * 3. Prix catalogue standard (prix_revendeur)
 * 4. null (produit non pricé)
 */
export function resoudrePrix(
  produit: Pick<StrapiProduitRaw, "prix_revendeur" | "prix_public" | "moq" | "prix_overrides">,
  ctx: PrixContext,
): PrixResolu {
  const overrides = produit.prix_overrides ?? [];

  // 1. Override individuel
  if (ctx.userId) {
    const individuel = overrides.find(
      (o) => o.user_id === ctx.userId && o.groupe === null,
    );
    if (individuel) {
      return {
        achat: individuel.prix_achat,
        revente: individuel.prix_revente,
        moq: individuel.moq ?? produit.moq ?? 1,
        source: "individuel",
      };
    }
  }

  // 2. Override de groupe
  if (ctx.groupeId) {
    const groupe = overrides.find(
      (o) => o.groupe?.id === ctx.groupeId && o.user_id === null,
    );
    if (groupe) {
      return {
        achat: groupe.prix_achat,
        revente: groupe.prix_revente,
        moq: groupe.moq ?? produit.moq ?? 1,
        source: "groupe",
      };
    }
  }

  // 3. Prix catalogue standard
  if (produit.prix_revendeur !== null) {
    return {
      achat: produit.prix_revendeur,
      revente: produit.prix_public,
      moq: produit.moq ?? 1,
      source: "catalogue",
    };
  }

  // 4. Aucun prix
  return { achat: null, revente: null, moq: produit.moq ?? 1, source: "aucun" };
}

// ── Helpers image ────────────────────────────────────────────────

function getStrapiImageUrl(image: StrapiImageRaw | null): string | null {
  if (!image) return null;
  // Préférer le format "medium" pour les grilles produits
  const url = image.formats?.medium?.url ?? image.formats?.small?.url ?? image.url;
  // Si l'URL est relative (upload local Strapi), la préfixer
  if (url.startsWith("/")) return `${STRAPI_URL}${url}`;
  return url; // URL absolue (Cloudinary, S3…)
}

// ── Mappers catalogue ────────────────────────────────────────────

function mapProduit(raw: StrapiProduitRaw, ctx?: PrixContext): CatalogProduct {
  const prix = ctx
    ? resoudrePrix(raw, ctx)
    : {
        achat: raw.prix_revendeur,
        revente: raw.prix_public,
        moq: raw.moq ?? 1,
        source: "catalogue" as const,
      };

  return {
    ref: raw.reference,
    label: raw.designation,
    ...(raw.note1 ? { note1: raw.note1 } : {}),
    ...(raw.note2 ? { note2: raw.note2 } : {}),
    moq: prix.moq,
    stock: raw.stock ?? undefined,
    ...(prix.achat !== null ? { resellerPrice: String(prix.achat) } : {}),
    ...(prix.revente !== null ? { retailPrice: String(prix.revente) } : {}),
    // URL image Cloudinary/Strapi — le front peut utiliser ce champ si présent
    ...(raw.image ? { imageUrl: getStrapiImageUrl(raw.image) ?? undefined } : {}),
  };
}

function mapCategorie(raw: StrapicategorieRaw): CatalogSubfamily {
  return {
    name: raw.titre,
    products: [],
    itemCount: 0,
    examples: [],
  };
}

function mapFamille(raw: StrapiFamilleRaw): CatalogFamily {
  const subfamilies = (raw.categories ?? [])
    .filter((c) => c.en_ligne)
    .sort((a, b) => a.ordre - b.ordre)
    .map(mapCategorie);

  return {
    id: raw.slug,
    name: raw.titre,
    strapline: raw.strapline ?? "",
    summary: raw.resume ?? "",
    accent: raw.accent ?? "#dbe7ff",
    surface: raw.surface ?? "rgba(219, 231, 255, 0.68)",
    businessSignals: raw.signaux_business ?? [],
    subfamilies,
    referenceCount: subfamilies.reduce((sum, s) => sum + s.itemCount, 0),
  };
}

// ── Public API — Catalogue ────────────────────────────────────────

export async function getStrapiFamilies(): Promise<CatalogFamily[]> {
  const data = await strapiGet<StrapiList<StrapiFamilleRaw>>(
    "/familles?populate=categories&filters[en_ligne][$eq]=true&sort=ordre:asc&pagination[pageSize]=100",
  );
  return data.data.filter((f) => f.en_ligne).map(mapFamille);
}

export async function getStrapiFamilyBySlug(slug: string): Promise<CatalogFamily | null> {
  const data = await strapiGet<StrapiList<StrapiFamilleRaw>>(
    `/familles?populate=categories&filters[slug][$eq]=${encodeURIComponent(slug)}&filters[en_ligne][$eq]=true&pagination[pageSize]=1`,
  );
  if (!data.data.length) return null;
  return mapFamille(data.data[0]);
}

export async function getStrapiProductsByCategory(
  familySlug: string,
  categorySlug: string,
  ctx?: PrixContext,
): Promise<CatalogProduct[]> {
  // populate=prix_overrides.groupe pour la résolution de prix
  const data = await strapiGet<StrapiList<StrapiProduitRaw>>(
    `/produits?populate=image,prix_overrides.groupe` +
    `&filters[categorie][slug][$eq]=${encodeURIComponent(categorySlug)}` +
    `&filters[categorie][famille][slug][$eq]=${encodeURIComponent(familySlug)}` +
    `&filters[en_ligne][$eq]=true` +
    `&sort=reference:asc&pagination[pageSize]=500`,
    { revalidate: 0 }, // pas de cache : les prix sont personnalisés par session
  );
  return data.data.map((p) => mapProduit(p, ctx));
}

export async function getStrapiSubfamily(
  familySlug: string,
  categorySlug: string,
  ctx?: PrixContext,
): Promise<{ family: CatalogFamily; subfamily: CatalogSubfamily } | null> {
  const [familyData, products] = await Promise.all([
    getStrapiFamilyBySlug(familySlug),
    getStrapiProductsByCategory(familySlug, categorySlug, ctx),
  ]);

  if (!familyData) return null;

  const subfamily = familyData.subfamilies.find(
    (s) => slugifyLabel(s.name) === categorySlug,
  );
  if (!subfamily) return null;

  const filledSubfamily: CatalogSubfamily = {
    ...subfamily,
    products,
    itemCount: products.length,
    examples: products.slice(0, 3).map((p) => p.label),
  };

  return { family: familyData, subfamily: filledSubfamily };
}

// ── Public API — Commandes ────────────────────────────────────────

export type CommandeItem = {
  ref: string;
  label: string;
  quantity: number;
  prixAchat?: number;
  prixRevente?: number;
};

export type Commande = {
  id: number;
  reference: string;
  statut: "en_attente" | "confirmee" | "expediee" | "annulee";
  client_societe: string;
  client_nom: string;
  client_email: string;
  client_telephone?: string;
  date_enlevement?: string;
  message?: string;
  items: CommandeItem[];
  total_achat_ht: number;
  total_revente: number;
  marge_projetee: number;
  createdAt: string;
};

type StrapiCommandeRaw = {
  id: number;
  documentId: string;
  reference: string;
  statut: string;
  client_societe: string;
  client_nom: string;
  client_email: string;
  client_telephone: string | null;
  date_enlevement: string | null;
  message: string | null;
  items: CommandeItem[] | null;
  total_achat_ht: number | null;
  total_revente: number | null;
  marge_projetee: number | null;
  strapi_user_id: number | null;
  createdAt: string;
};

function mapCommande(raw: StrapiCommandeRaw): Commande {
  return {
    id: raw.id,
    reference: raw.reference,
    statut: (raw.statut as Commande["statut"]) ?? "en_attente",
    client_societe: raw.client_societe,
    client_nom: raw.client_nom,
    client_email: raw.client_email,
    client_telephone: raw.client_telephone ?? undefined,
    date_enlevement: raw.date_enlevement ?? undefined,
    message: raw.message ?? undefined,
    items: raw.items ?? [],
    total_achat_ht: raw.total_achat_ht ?? 0,
    total_revente: raw.total_revente ?? 0,
    marge_projetee: raw.marge_projetee ?? 0,
    createdAt: raw.createdAt,
  };
}

export async function saveCommandeStrapi(
  commande: Omit<Commande, "id" | "statut" | "createdAt"> & { strapiUserId?: number },
): Promise<void> {
  if (!isStrapiConfigured()) return;
  await strapiPost("/commandes", {
    ...commande,
    statut: "en_attente",
    strapi_user_id: commande.strapiUserId ?? null,
  });
}

export async function getCommandesByEmail(email: string): Promise<Commande[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const data = await strapiGet<StrapiList<StrapiCommandeRaw>>(
      `/commandes?filters[client_email][$eq]=${encodeURIComponent(email)}&sort=createdAt:desc&pagination[pageSize]=50`,
      { revalidate: 0 },
    );
    return data.data.map(mapCommande);
  } catch {
    return [];
  }
}

/**
 * Décrémente le stock des produits après confirmation d'une commande.
 * Appelé depuis le webhook Strapi ou manuellement via API route.
 * Silencieux si le stock n'est pas géré (stock = null).
 */
export async function decrementeStock(items: CommandeItem[]): Promise<void> {
  if (!isStrapiConfigured()) return;

  for (const item of items) {
    try {
      // Chercher le produit par référence
      const data = await strapiGet<StrapiList<StrapiProduitRaw>>(
        `/produits?filters[reference][$eq]=${encodeURIComponent(item.ref)}&pagination[pageSize]=1`,
        { revalidate: 0 },
      );
      const produit = data.data[0];
      if (!produit || produit.stock === null) continue;

      const newStock = Math.max(0, produit.stock - item.quantity);
      await strapiPatch(`/produits/${produit.documentId}`, { stock: newStock });
    } catch {
      // Non bloquant — log en production
      console.warn(`[strapi] Impossible de décrémenter le stock de ${item.ref}`);
    }
  }
}
