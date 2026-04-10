import { CartSidebar } from "@/components/cart/cart-sidebar";
import { CatalogSidebarClient } from "@/components/catalog/catalog-sidebar-client";
import { CatalogFooter } from "@/components/layout/catalog-footer";
import { getCatalogFamiliesData } from "@/lib/catalog-source";

import styles from "./layout.module.css";

/**
 * Layout persistant pour toutes les routes /catalogue/*.
 *
 * Architecture "Rock Solid" :
 *   Gauche  — CatalogSidebarClient  → ne se démonte JAMAIS entre navigations
 *   Centre  — {children}            → SEULE zone qui change lors d'un changement de route
 *   Droite  — CartSidebar           → ne se démonte JAMAIS, l'état du panier est préservé
 *
 * Les données du catalogue sont fetchées une seule fois ici (côté serveur)
 * et passées au composant client qui dérive l'état actif via usePathname().
 */
export default async function CatalogueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const families = await getCatalogFamiliesData();

  return (
    <div className={styles.shell}>
      <div className={styles.leftCol}>
        <CatalogSidebarClient families={families} />
      </div>

      <main className={styles.centerCol}>
        {children}
        <CatalogFooter />
      </main>

      <div className={styles.rightCol}>
        <CartSidebar />
      </div>
    </div>
  );
}
