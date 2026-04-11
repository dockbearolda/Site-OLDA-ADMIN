export type CatalogProduct = {
  ref: string;
  label: string;
  note1?: string;
  note2?: string;
  minimumOrder?: string;
  moq?: number;        // minimum de commande fonctionnel (multiple obligatoire)
  retailPrice?: string;
  resellerPrice?: string;
  stock?: number;      // inventaire réel — connecter à l'API Strapi ou inventaire
  imageUrl?: string;   // URL Cloudinary/Strapi (prioritaire sur l'image locale)
};

export type CatalogSubfamily = {
  name: string;
  products: readonly CatalogProduct[];
  itemCount: number;
  examples: readonly string[];
};

export type CatalogFamily = {
  id: string;
  name: string;
  strapline: string;
  summary: string;
  accent: string;
  surface: string;
  businessSignals: readonly string[];
  subfamilies: readonly CatalogSubfamily[];
  referenceCount: number;
};

export type FeaturedReference = {
  ref: string;
  family: string;
  label: string;
  detail: string;
  note: string;
  accent: string;
  surface: string;
};

type ProcessStep = {
  number: string;
  title: string;
  body: string;
};

type Insight = {
  title: string;
  body: string;
};

type CatalogSubfamilyBlueprint = {
  name: string;
  products: readonly CatalogProduct[];
};

type CatalogFamilyBlueprint = {
  id: string;
  name: string;
  strapline: string;
  summary: string;
  accent: string;
  surface: string;
  businessSignals: readonly string[];
  subfamilies: readonly CatalogSubfamilyBlueprint[];
  defaultMoq?: number; // MOQ appliqué à tous les produits de la famille si non défini au niveau produit
};

const stockDesignNote = "Choix de designs en fonction du stock";
const mugCapacityNote = "350 ml";

function product(
  ref: string,
  label: string,
  extras: Omit<CatalogProduct, "ref" | "label"> = {},
): CatalogProduct {
  return {
    ref,
    label,
    ...extras,
  };
}

const ceramicVariantLabels = [
  "Tasse Rouge - Blanc",
  "Tasse Orange - Blanc",
  "Tasse Rose - Blanc",
  "Tasse Bleu - Blanc",
  "Tasse Vert - Blanc",
  "Tasse Noir - Blanc",
  "Tasse Blanc - Bleu",
  "Tasse Blanc - Jaune",
  "Tasse Blanc - Orange",
  "Tasse Blanc - Rouge",
  "Tasse Blanc - Vert",
  "Tasse Blanc - Noir",
  "Tasse Noir - Rose",
  "Tasse Noir - Jaune",
  "Tasse Noir - Rouge",
  "Tasse Noir - Vert",
  "Tasse Noir - Orange",
] as const;

function buildCeramicProducts(
  prefix: string,
  extras: Omit<CatalogProduct, "ref" | "label"> = {},
) {
  return ceramicVariantLabels.map((label, index) =>
    product(`${prefix} ${String(index + 1).padStart(2, "0")}`, label, extras),
  );
}

const familyBlueprint: readonly CatalogFamilyBlueprint[] = [
  {
    id: "goodies",
    name: "Goodies",
    defaultMoq: 10,
    strapline: "Formats rapides à activer",
    summary:
      "Porte-clés, magnets et stickers pour opérations terrain, coffrets clients et revente boutique.",
    accent: "#dbe7ff",
    surface: "rgba(219, 231, 255, 0.68)",
    businessSignals: [
      "Des formats compacts faciles à diffuser en salon, boutique ou gifting.",
      "Des formats compacts prêts à intégrer dans une offre B2B.",
    ],
    subfamilies: [
      {
        name: "Porte-Clés",
        products: [
          product("PCP 01", "Porte-Clés Plexiglass", { moq: 10, resellerPrice: "2.50", retailPrice: "5.00" }),
          product("PCB 01", "Porte-Clés Bois", { moq: 10, resellerPrice: "4.50", retailPrice: "9.00" }),
          product("PCA 01", "Porte-Clés Acrylique", { moq: 10, resellerPrice: "4.50", retailPrice: "9.00" }),
          product("PCFL 01", "Porte-Clés Flotteur Liège", { moq: 3, resellerPrice: "7.00", retailPrice: "14.00" }),
        ],
      },
      {
        name: "Magnets",
        products: [
          product("MP 01", "Magnet Plexiglass"),
          product("MB 01", "Magnet Bois"),
          product("MA 01", "Magnet Acrylique"),
        ],
      },
      {
        name: "Sticker",
        products: [
          product("STI 01", "Sticker", {
            note2: "75 x 75",
          }),
        ],
      },
    ],
  },
  {
    id: "tasses",
    name: "Tasses",
    strapline: "La famille la plus profonde du catalogue",
    summary:
      "Déclinaisons céramique, métal et bois avec une grande variété de coloris et un standard 350 ml bien identifié.",
    accent: "#dfead7",
    surface: "rgba(223, 234, 215, 0.72)",
    businessSignals: [
      "Plusieurs références indiquent des designs disponibles selon le stock.",
      "Une largeur d'offre utile pour cadeaux clients, vente additionnelle et séries récurrentes.",
    ],
    subfamilies: [
      {
        name: "Tasse Céramique FUCK",
        products: buildCeramicProducts("TCF", {
          note2: mugCapacityNote,
          moq: 3,
          resellerPrice: "8 €",
          retailPrice: "16 €",
        }),
      },
      {
        name: "Tasse Céramique",
        products: buildCeramicProducts("TC", {
          note1: stockDesignNote,
          note2: mugCapacityNote,
          moq: 3,
          resellerPrice: "8 €",
          retailPrice: "16 €",
        }),
      },
      {
        name: "Tasse Métal",
        products: [
          product("TM 01", "Tasse Métal Rouge", { resellerPrice: "8 €", retailPrice: "16 €" }),
          product("TM 02", "Tasse Métal Blanc", { resellerPrice: "8 €", retailPrice: "16 €" }),
          product("TM 03", "Tasse Métal Jaune", { resellerPrice: "8 €", retailPrice: "16 €" }),
          product("TM 04", "Tasse Métal Bleu", { resellerPrice: "8 €", retailPrice: "16 €" }),
        ],
      },
      {
        name: "Autres Tasses",
        products: [product("TB-01", "Tasse Bois", { resellerPrice: "8 €", retailPrice: "16 €" })],
      },
    ],
  },
  {
    id: "accessoires",
    name: "Accessoires",
    strapline: "Le catalogue de complément qui crédibilise l'offre",
    summary:
      "Accessoires du quotidien, art de la table, papeterie et jeux pour enrichir une offre B2B sans brouiller la lecture.",
    accent: "#f4dc95",
    surface: "rgba(244, 220, 149, 0.72)",
    businessSignals: [
      "Quelques références affichent déjà un minimum de commande, parfois dès 3 unités.",
      "La ligne papeterie montre un bon potentiel pour du corporate branding et des packs événementiels.",
    ],
    subfamilies: [
      {
        name: "Du quotidien",
        products: [
          product("SMA 01", "Support Mobile Acrylique"),
          product("SMB 01", "Support Mobile Bois"),
          product("PS 01", "Porte Sac", { moq: 3 }),
          product("FBC 01", "Flasque Bois Clair"),
          product("FCF 01", "Flasque Bois Foncé"),
          product("LBF 01", "Limonadier Bois Foncé"),
          product("LBC 01", "Limonadier Bois Clair"),
          product("IVL 01", "Identificateur Valise Liège"),
          product("IVS 01", "Identificateur Valise Similicuir"),
          product("PML 01", "Petit Miroir Liège"),
          product("CMB 01", "Couteau Multi Bois"),
          product("CML 01", "Couteau Multi Liège"),
          product("PBA 01", "Pince à billet Argent"),
        ],
      },
      {
        name: "Art de la table",
        products: [
          product("BB 01", "Bouchon Bois"),
          product("DPL 01", "Dessous de plat Liège"),
          product("DVL 01", "Dessous de Verre Liège (par 1)"),
          product("PL 01", "Plateau en Liège"),
        ],
      },
      {
        name: "Papeterie",
        products: [
          product("CPB 01", "Crayon papier bois", {
            moq: 10,
          }),
          product("SBB 01", "Stylo à bille en bois"),
          product("BNLP", "Bloc Note Liège A6 Petit", {
            note1: stockDesignNote,
          }),
          product("BNSP", "Bloc Note Similicuir A6 Petit", {
            note1: stockDesignNote,
          }),
          product("BNLG", "Bloc Note Liège A5 Grand", {
            note1: stockDesignNote,
          }),
          product("BNSG", "Bloc Note Similicuir A5 Grand", {
            note1: stockDesignNote,
          }),
          product("CP 01", "Carte Postale A6 (105 x 148)"),
          product("AT 01", "Affiche A3 + Tube (297 x 420)"),
        ],
      },
      {
        name: "Jeux",
        products: [
          product("MOR 01", "Morpion"),
          product("DOM 01", "Dominos"),
          product("MIK 01", "Mikado"),
          product("YO 01", "Yoyo"),
          product("JDC 01", "Jeux de Cartes"),
          product("RB 01", "Raquette Bois"),
        ],
      },
    ],
  },
  {
    id: "offres-speciales",
    name: "Offres spéciales",
    strapline: "Une capsule à mettre en avant avec parcimonie",
    summary:
      "Une sélection plus resserrée pour créer un sentiment d'exclusivité, de série courte ou de proposition événementielle.",
    accent: "#dcffca",
    surface: "rgba(220, 255, 202, 0.72)",
    businessSignals: [
      "Très bon terrain pour une mise en scène premium et des lancements saisonniers.",
      "Peut devenir une rubrique éditoriale à part entière sans alourdir la navigation principale.",
    ],
    subfamilies: [
      {
        name: "Sélection spéciale",
        products: [
          product("PCL 01", "Porte Carte Liège"),
          product("PMO 01", "Porte Monnaie Liège"),
          product("BBB 01", "Boîte à bijoux en bois"),
          product("DB 01", "Décapsuleur Bois"),
          product("BCC 01", "Boîte à clic-clac"),
          product("CL 01", "Cendrier Liège"),
        ],
      },
    ],
  },
  {
    id: "textiles",
    name: "Textiles",
    strapline: "Entrée propre dans le soft goods",
    summary:
      "Pochettes et sacs pour compléter l'offre d'objets avec une base textile simple, lisible et facilement scénarisable.",
    accent: "#efc58d",
    surface: "rgba(239, 197, 141, 0.7)",
    businessSignals: [
      "Des produits faciles à décliner en page famille, usage ou matériau.",
      "Le tote bag bio, les pochettes EarthAware et les sacs plage donnent déjà une ligne claire.",
    ],
    subfamilies: [
      {
        name: "Pochettes",
        products: [
          product("P-001", "Trousse de toilette"),
          product("P-002", "Pochette EarthAware Bio S"),
          product("P-003", "Pochette EarthAware Bio L"),
          product("P-004", "Pochette Zippée S"),
          product("P-005", "Pochette Zippée M"),
          product("P-006", "Pochette Vintage"),
          product("P-007", "Pochette Coton S"),
          product("P-008", "Pochette Coton M"),
        ],
      },
      {
        name: "Sacs",
        products: [
          product("S-001", "Sac de plage Naturel"),
          product("S-002", "Sac de plage XL"),
          product("S-003", "Sac Polochon en Molleton"),
          product("S-004", "Tote Bag en Coton BIO"),
        ],
      },
    ],
  },
] as const;

export const catalogFamilies: CatalogFamily[] = familyBlueprint.map((family) => {
  const subfamilies: CatalogSubfamily[] = family.subfamilies.map((subfamily) => ({
    ...subfamily,
    products: subfamily.products.map((p) => ({
      ...p,
      moq: p.moq ?? family.defaultMoq ?? 1,
    })),
    itemCount: subfamily.products.length,
    examples: subfamily.products.slice(0, 4).map((entry) => entry.label),
  }));

  return {
    ...family,
    subfamilies,
    referenceCount: subfamilies.reduce(
      (total, subfamily) => total + subfamily.itemCount,
      0,
    ),
  };
});

export const catalogFamilyDisplayOrder = [
  "tasses",
  "goodies",
  "textiles",
  "accessoires",
  "offres-speciales",
] as const;

export const orderedCatalogFamilies = catalogFamilyDisplayOrder
  .map((id) => catalogFamilies.find((family) => family.id === id))
  .filter((family) => family !== undefined);

export const catalogSummary = {
  totalFamilies: catalogFamilies.length,
  totalReferences: catalogFamilies.reduce(
    (total, family) => total + family.referenceCount,
    0,
  ),
  minimumOrderHint: "à partir de 3 unités",
  stockSignal: "designs selon stock",
  mugCapacity: mugCapacityNote,
  pendingReferences: 0,
} as const;

export const catalogInsights: Insight[] = [
  {
    title: "Structure prête à vendre",
    body:
      "Le catalogue distingue déjà famille, référence interne et désignation. C'est exactement le niveau de clarté attendu pour un site B2B sérieux.",
  },
  {
    title: "Signaux commerciaux visibles",
    body:
      "Minimums de commande, capacités et formats sont déjà présents sur plusieurs lignes. La confiance se construit sur cette précision.",
  },
  {
    title: "Personnalisation cadrée",
    body:
      "Les notes de stock récurrentes montrent que le discours commercial peut rester premium sans promettre une personnalisation infinie et fragile.",
  },
];

export const featuredReferences: FeaturedReference[] = [
  {
    ref: "PCP 01",
    family: "Goodies",
    label: "Porte-Clés Plexiglass",
    detail:
      "Une entrée de gamme propre pour coffrets, salons ou comptoirs avec un encombrement minimal.",
    note: "Diffusion rapide · support compact",
    accent: "#dbe7ff",
    surface: "rgba(219, 231, 255, 0.52)",
  },
  {
    ref: "TC 07",
    family: "Tasses",
    label: "Tasse Blanc - Bleu",
    detail:
      "Référence céramique 350 ml avec logique de design selon stock, idéale pour une offre flexible.",
    note: "350 ml · designs selon stock",
    accent: "#dfead7",
    surface: "rgba(223, 234, 215, 0.56)",
  },
  {
    ref: "SMA 01",
    family: "Accessoires",
    label: "Support Mobile Acrylique",
    detail:
      "Produit utile, lisible et immédiatement compréhensible pour une clientèle pro orientée usage.",
    note: "Accessoire quotidien · lisibilité forte",
    accent: "#f4dc95",
    surface: "rgba(244, 220, 149, 0.56)",
  },
  {
    ref: "BNLG",
    family: "Accessoires",
    label: "Bloc Note Liège A5 Grand",
    detail:
      "Une référence corporate évidente pour bureaux, événements et cadeaux à forte valeur perçue.",
    note: "Papeterie · design selon stock",
    accent: "#f4dc95",
    surface: "rgba(244, 220, 149, 0.56)",
  },
  {
    ref: "PCL 01",
    family: "Offres spéciales",
    label: "Porte Carte Liège",
    detail:
      "Sélection capsule qui peut soutenir un angle exclusif ou une offre événementielle plus limitée.",
    note: "Capsule premium · série courte",
    accent: "#dcffca",
    surface: "rgba(220, 255, 202, 0.58)",
  },
  {
    ref: "S-004",
    family: "Textiles",
    label: "Tote Bag en Coton BIO",
    detail:
      "Une base textile claire, durable et naturellement cohérente avec une identité premium contemporaine.",
    note: "Textile · usage universel",
    accent: "#efc58d",
    surface: "rgba(239, 197, 141, 0.56)",
  },
];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Cadrer le besoin",
    body:
      "Usage, cible, quantités, timing et niveau de personnalisation sont alignés avant toute sélection.",
  },
  {
    number: "02",
    title: "Composer la sélection",
    body:
      "Les familles servent de grille simple pour proposer une offre courte, pertinente et crédible.",
  },
  {
    number: "03",
    title: "Valider la personnalisation",
    body:
      "Les variantes, formats, minimums de commande et contraintes de stock sont posés sans ambiguïté.",
  },
  {
    number: "04",
    title: "Lancer la production",
    body:
      "Une fois la sélection validée, le site doit guider proprement vers la demande de devis et la mise en production.",
  },
];

export function getCatalogFamilyById(id: string) {
  return catalogFamilies.find((family) => family.id === id);
}

export function getFeaturedReferencesByFamily(familyName: string) {
  return featuredReferences.filter((reference) => reference.family === familyName);
}

export function slugifyLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCatalogSubfamilyBySlug(
  familyId: string,
  subfamilySlug: string,
) {
  const family = getCatalogFamilyById(familyId);

  if (!family) {
    return null;
  }

  const subfamily = family.subfamilies.find(
    (entry) => slugifyLabel(entry.name) === subfamilySlug,
  );

  if (!subfamily) {
    return null;
  }

  return { family, subfamily };
}
