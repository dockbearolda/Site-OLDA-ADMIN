/**
 * Retourne le chemin de l'image d'un produit à partir de sa référence.
 * Ex : "PCP 01" → "/images/PCP01.webp"
 */

// Correspondances manuelles pour les refs dont le nom de fichier diffère
const IMAGE_OVERRIDES: Record<string, string> = {
  "PML 01": "ML01",   // Petit Miroir Liège
  "PMO 01": "PML01",  // Porte Monnaie Liège
  "FCF 01": "FBF01",
  "BNSG":   "BNS5",
  "TC 09":  "TC09",
  // Tasses Métal — les fichiers image étaient décalés par rapport aux couleurs
  "TM 01":  "TM04",   // Rouge → TM04.webp (rouge)
  "TM 02":  "TM01",   // Blanc → TM01.webp (blanc)
  "TM 04":  "TM02",   // Bleu  → TM02.webp (bleu)
};

// Refs sans photo disponible
const NO_IMAGE = new Set([
  "PCFL 01", "IVS 01", "CMB 01", "BNSP", "AT 01",
  "DB 01", "TB-01", "SMB 01", "SMA 01",
  "P-001", "P-002", "P-003", "P-004",
  "P-005", "P-006", "P-007", "P-008",
  "S-001", "S-002", "S-003", "S-004",
]);

export function getProductImagePath(ref: string): string | null {
  // Override manuel en priorité
  if (ref in IMAGE_OVERRIDES) {
    return `/images/${IMAGE_OVERRIDES[ref]}.webp`;
  }
  // Pas d'image disponible
  if (NO_IMAGE.has(ref)) return null;
  // Règle générale : supprimer les espaces
  const filename = ref.replace(/\s+/g, "");
  return `/images/${filename}.webp`;
}
