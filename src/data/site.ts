// Centralized brand and contact placeholders to keep integration changes localized.
export const siteConfig = {
  name: "OLDA",
  baseline: "Objets personnalisables B2B",
  description:
    "Objets, tasses, accessoires et textiles personnalisables pour marques, boutiques et clients professionnels exigeants.",
  navigation: [
    { label: "Catalogue", href: "/catalogue" },
    { label: "Sélection", href: "/#selection" },
    { label: "Méthode", href: "/#methode" },
    { label: "Contact", href: "/#contact" },
  ],
  contact: {
    email: "contact@votre-marque.fr",
    phone: "+33 0 0 00 00 00",
    location: "France · accompagnement B2B",
  },
} as const;
