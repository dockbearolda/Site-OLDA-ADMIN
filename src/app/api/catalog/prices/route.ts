import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { catalogFamilies } from "@/data/catalog";

/**
 * GET /api/catalog/prices
 *
 * Retourne un dictionnaire ref → { prixRevendeur, prixPublic, coef }
 * uniquement pour les utilisateurs authentifiés (B2B).
 *
 * Le prixRevendeur (prix d'achat) ne transite JAMAIS vers le client
 * sans session valide — il n'est pas dans le bundle JS statique.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Construire la map ref → prix
  const prices: Record<string, {
    prixRevendeur: number | null;
    prixPublic: number | null;
    coef: number | null;
  }> = {};

  for (const family of catalogFamilies) {
    for (const subfamily of family.subfamilies) {
      for (const product of subfamily.products) {
        const achat = parseFloat(
          (product.resellerPrice ?? "").replace(/[^\d.,]/g, "").replace(",", "."),
        );
        const revente = parseFloat(
          (product.retailPrice ?? "").replace(/[^\d.,]/g, "").replace(",", "."),
        );

        const prixRevendeur = isNaN(achat) ? null : achat;
        const prixPublic = isNaN(revente) ? null : revente;
        const coef =
          prixRevendeur && prixPublic && prixRevendeur > 0
            ? Math.round((prixPublic / prixRevendeur) * 100) / 100
            : null;

        prices[product.ref] = { prixRevendeur, prixPublic, coef };
      }
    }
  }

  return NextResponse.json(prices, {
    headers: {
      // Ne pas mettre en cache — les prix peuvent changer
      "Cache-Control": "no-store",
      // Empêcher les navigateurs de mettre en cache côté client
      "Pragma": "no-cache",
    },
  });
}
