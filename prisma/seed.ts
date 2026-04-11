/**
 * Seed initial — peuple la base avec le catalogue statique.
 * Exécuter : npx prisma db seed
 * (ou automatiquement lors de la première migration sur Railway)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parsePrice(price?: string): number | undefined {
  if (!price) return undefined;
  const n = parseFloat(price.replace(",", ".").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? undefined : n;
}

const catalogData = [
  {
    slug: "tasses",
    nom: "Tasses",
    strapline: "La famille la plus profonde du catalogue",
    resume: "Déclinaisons céramique, métal et bois avec une grande variété de coloris et un standard 350 ml bien identifié.",
    accent: "#dfead7",
    surface: "rgba(223, 234, 215, 0.72)",
    signauxBusiness: [
      "Plusieurs références indiquent des designs disponibles selon le stock.",
      "Une largeur d'offre utile pour cadeaux clients, vente additionnelle et séries récurrentes.",
    ],
    ordre: 0,
    categories: [
      {
        nom: "Tasse Céramique FUCK",
        slug: "tasse-ceramique-fuck",
        ordre: 0,
        produits: [
          { ref: "TCF 02", label: "Tasse Orange - Blanc", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TCF 03", label: "Tasse Rose - Blanc", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TCF 05", label: "Tasse Bleu - Blanc", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TCF 06", label: "Tasse Noir - Blanc", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TCF 10", label: "Tasse Blanc - Rouge", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TCF 14", label: "Tasse Noir - Jaune", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TCF 15", label: "Tasse Noir - Rouge", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
        ],
      },
      {
        nom: "Tasse Céramique",
        slug: "tasse-ceramique",
        ordre: 1,
        produits: [
          { ref: "TC 03", label: "Tasse Rose - Blanc", note1: "Choix de designs en fonction du stock", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TC 04", label: "Tasse Bleu - Blanc", note1: "Choix de designs en fonction du stock", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TC 09", label: "Tasse Blanc - Orange", note1: "Choix de designs en fonction du stock", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TC 10", label: "Tasse Blanc - Rouge", note1: "Choix de designs en fonction du stock", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TC 15", label: "Tasse Noir - Rouge", note1: "Choix de designs en fonction du stock", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
          { ref: "TC 16", label: "Tasse Noir - Vert", note1: "Choix de designs en fonction du stock", note2: "350 ml", moq: 3, step: 3, prixRevendeur: 10.20, prixPublic: 18, enLigne: true },
        ],
      },
      {
        nom: "Tasse Métal",
        slug: "tasse-metal",
        ordre: 2,
        produits: [
          { ref: "TM 04", label: "Tasse Métal Bleu", note1: "Choix de designs en fonction du stock", note2: "?", moq: 3, step: 3, prixRevendeur: 9, prixPublic: 15, enLigne: true },
        ],
      },
      {
        nom: "Autres Tasses",
        slug: "autres-tasses",
        ordre: 3,
        produits: [
          { ref: "TB-01", label: "Tasse Bois", moq: 1, prixRevendeur: 15.00, prixPublic: 22, enLigne: true },
        ],
      },
    ],
  },
  {
    slug: "goodies",
    nom: "Goodies",
    strapline: "Formats rapides à activer",
    resume: "Porte-clés, magnets et stickers pour opérations terrain, coffrets clients et revente boutique.",
    accent: "#dbe7ff",
    surface: "rgba(219, 231, 255, 0.68)",
    signauxBusiness: [
      "Des formats compacts faciles à diffuser en salon, boutique ou gifting.",
      "Des formats compacts prêts à intégrer dans une offre B2B.",
    ],
    ordre: 1,
    categories: [
      {
        nom: "Porte-Clés",
        slug: "porte-cles",
        ordre: 0,
        produits: [
          { ref: "PCP 01", label: "Porte-Clés Plexiglass", note1: "Mix logo selon disponibilité", moq: 10, step: 10, prixRevendeur: 2.50, prixPublic: 5, enLigne: true },
          { ref: "PCB 01", label: "Porte-Clés Bois", moq: 10, step: 10, prixRevendeur: 4.50, prixPublic: 9, enLigne: true },
          { ref: "PCA 01", label: "Porte-Clés Acrylique", moq: 10, step: 10, prixRevendeur: 4.50, prixPublic: 9, enLigne: true },
          { ref: "PCFL 01", label: "Porte-Clés Flotteur Liège", moq: 2, step: 4, prixRevendeur: 7, prixPublic: 14, enLigne: true },
        ],
      },
      {
        nom: "Magnets",
        slug: "magnets",
        ordre: 1,
        produits: [
          { ref: "VP 01", label: "Magnet Plexiglass", moq: 10, step: 10, prixRevendeur: 2.50, prixPublic: 5, enLigne: true },
          { ref: "MB 01", label: "Magnet Bois", moq: 10, step: 10, prixRevendeur: 4.50, prixPublic: 9, enLigne: true },
        ],
      },
    ],
  },
  {
    slug: "accessoires",
    nom: "Accessoires",
    strapline: "Le catalogue de complément qui crédibilise l'offre",
    resume: "Accessoires du quotidien, art de la table, papeterie et jeux pour enrichir une offre B2B sans brouiller la lecture.",
    accent: "#f4dc95",
    surface: "rgba(244, 220, 149, 0.72)",
    signauxBusiness: [
      "Quelques références affichent déjà un minimum de commande, parfois dès 3 unités.",
      "La ligne papeterie montre un bon potentiel pour du corporate branding et des packs événementiels.",
    ],
    ordre: 3,
    categories: [
      {
        nom: "Du quotidien",
        slug: "du-quotidien",
        ordre: 0,
        produits: [
          { ref: "FCF 01", label: "Flasque Bois Foncé", moq: 2, step: 2, prixRevendeur: 12.00, prixPublic: 22, enLigne: true },
          { ref: "LBF 01", label: "Limonadier Bois Foncé", moq: 4, step: 4, prixRevendeur: 6, prixPublic: 12, enLigne: true },
          { ref: "CMB 01", label: "Couteau Multi Bois", moq: 4, step: 4, prixRevendeur: 9, prixPublic: 18, enLigne: false },
          { ref: "CML 01", label: "Couteau Multi Liège", moq: 4, step: 4, prixRevendeur: 9, prixPublic: 18, enLigne: false },
        ],
      },
      {
        nom: "Art de la table",
        slug: "art-de-la-table",
        ordre: 1,
        produits: [
          { ref: "DVL 01", label: "Dessous de Verre Liège (par 1)", moq: 12, step: 24, prixRevendeur: 3, prixPublic: 6, enLigne: true },
          { ref: "DVA 01", label: "Dessous de Verre Acrylique (par 1)", moq: 12, step: 24, prixRevendeur: 3, prixPublic: 6, enLigne: false },
        ],
      },
      {
        nom: "Papeterie",
        slug: "papeterie",
        ordre: 2,
        produits: [
          { ref: "BNSP", label: "Bloc Note Similicuir A6 Petit", note1: "Choix de designs en fonction du stock", moq: 4, step: 4, prixRevendeur: 7.50, prixPublic: 15, enLigne: false },
          { ref: "BNLG", label: "Bloc Note Liège A5 Grand", note1: "Choix de designs en fonction du stock", moq: 4, step: 4, prixRevendeur: 9.50, prixPublic: 19, enLigne: false },
        ],
      },
      {
        nom: "Jeux",
        slug: "jeux",
        ordre: 3,
        produits: [
          { ref: "DOM 01", label: "Dominos", moq: 2, step: 4, prixRevendeur: 7.50, prixPublic: 15, enLigne: true },
          { ref: "MIK 01", label: "Mikado", moq: 2, step: 4, prixRevendeur: 7.50, prixPublic: 15, enLigne: true },
        ],
      },
    ],
  },
  {
    slug: "offres-speciales",
    nom: "Offres spéciales",
    strapline: "Une capsule à mettre en avant avec parcimonie",
    resume: "Une sélection plus resserrée pour créer un sentiment d'exclusivité, de série courte ou de proposition événementielle.",
    accent: "#dcffca",
    surface: "rgba(220, 255, 202, 0.72)",
    signauxBusiness: [
      "Très bon terrain pour une mise en scène premium et des lancements saisonniers.",
      "Peut devenir une rubrique éditoriale à part entière sans alourdir la navigation principale.",
    ],
    ordre: 4,
    categories: [
      {
        nom: "Sélection spéciale",
        slug: "selection-speciale",
        ordre: 0,
        produits: [
          { ref: "PML 01", label: "Porte Monnaie Liège", moq: 2, step: 2, prixRevendeur: 4.50, prixPublic: 9, enLigne: true },
          { ref: "BBB 01", label: "Boîte à bijoux bois", moq: 2, step: 2, prixRevendeur: 4.50, prixPublic: 9, enLigne: true },
        ],
      },
    ],
  },
  {
    slug: "textiles",
    nom: "Textiles",
    strapline: "Entrée propre dans le soft goods",
    resume: "Pochettes et sacs pour compléter l'offre d'objets avec une base textile simple, lisible et facilement scénarisable.",
    accent: "#efc58d",
    surface: "rgba(239, 197, 141, 0.7)",
    signauxBusiness: [
      "Des produits faciles à décliner en page famille, usage ou matériau.",
      "Le tote bag bio, les pochettes EarthAware et les sacs plage donnent déjà une ligne claire.",
    ],
    ordre: 2,
    categories: [
      {
        nom: "Pochettes",
        slug: "pochettes",
        ordre: 0,
        produits: [
          { ref: "P-002", label: "Pochette EarthAware Bio S", moq: 5, step: 5, prixRevendeur: 11, prixPublic: 22, enLigne: false },
          { ref: "P-003", label: "Pochette EarthAware Bio L", moq: 5, step: 5, prixRevendeur: 14.50, prixPublic: 29, enLigne: false },
          { ref: "P-001", label: "Pochette Coton M", moq: 5, step: 5, prixRevendeur: 11, prixPublic: 22, enLigne: false },
        ],
      },
      {
        nom: "Sacs",
        slug: "sacs",
        ordre: 1,
        produits: [
          { ref: "S-001", label: "Sac de plage Naturel", moq: 5, step: 5, prixRevendeur: 19.50, prixPublic: 39, enLigne: false },
        ],
      },
    ],
  },
] as const;

async function main() {
  console.log("🌱 Début du seed…");

  for (const famille of catalogData) {
    const createdFamille = await prisma.famille.upsert({
      where: { slug: famille.slug },
      update: {
        nom: famille.nom,
        strapline: famille.strapline,
        resume: famille.resume,
        accent: famille.accent,
        surface: famille.surface,
        signauxBusiness: [...famille.signauxBusiness],
        ordre: famille.ordre,
      },
      create: {
        slug: famille.slug,
        nom: famille.nom,
        strapline: famille.strapline,
        resume: famille.resume,
        accent: famille.accent,
        surface: famille.surface,
        signauxBusiness: [...famille.signauxBusiness],
        ordre: famille.ordre,
      },
    });

    for (const categorie of famille.categories) {
      const createdCategorie = await prisma.categorie.upsert({
        where: { slug_familleId: { slug: categorie.slug, familleId: createdFamille.id } },
        update: { nom: categorie.nom, ordre: categorie.ordre },
        create: {
          slug: categorie.slug,
          nom: categorie.nom,
          ordre: categorie.ordre,
          familleId: createdFamille.id,
        },
      });

      for (const produit of categorie.produits) {
        const p = produit as {
          ref: string; label: string;
          note1?: string; note2?: string;
          moq?: number; step?: number;
          prixRevendeur?: number; prixPublic?: number;
          enLigne?: boolean;
        };
        await prisma.produit.upsert({
          where: { reference: p.ref },
          update: {
            designation: p.label,
            note1: p.note1 ?? null,
            note2: p.note2 ?? null,
            moq: p.moq ?? null,
            step: p.step ?? null,
            prixRevendeur: p.prixRevendeur ?? null,
            prixPublic: p.prixPublic ?? null,
            enLigne: p.enLigne ?? true,
            categorieId: createdCategorie.id,
          },
          create: {
            reference: p.ref,
            designation: p.label,
            note1: p.note1 ?? null,
            note2: p.note2 ?? null,
            moq: p.moq ?? null,
            step: p.step ?? null,
            prixRevendeur: p.prixRevendeur ?? null,
            prixPublic: p.prixPublic ?? null,
            enLigne: p.enLigne ?? true,
            categorieId: createdCategorie.id,
          },
        });
      }
      console.log(`  ✓ ${famille.nom} → ${categorie.nom} (${categorie.produits.length} produits)`);
    }
  }

  console.log("✅ Seed terminé !");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
