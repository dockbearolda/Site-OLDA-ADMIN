import { CartSidebar } from "@/components/cart/cart-sidebar";
import styles from "./catalog-shell.module.css";

type CatalogShellProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shell 3 colonnes pour toutes les pages catalogue.
 * Gauche : navigation (CatalogSidebar — RSC avec props actives)
 * Centre  : contenu produits (scrollable indépendamment)
 * Droite  : panier permanent (CartSidebar — client component)
 *
 * Sur ≥1280px : POS-style, viewport verrouillé, colonnes indépendantes.
 * Sur <1280px  : 2 colonnes + CartButton mobile ouvre le Drawer.
 * Sur <980px   : 1 colonne, sidebar redevient nav horizontale (CSS existant).
 */
export function CatalogShell({ sidebar, children }: CatalogShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.leftCol}>
        {sidebar}
      </div>

      <main className={styles.centerCol}>
        {children}
      </main>

      <div className={styles.rightCol}>
        <CartSidebar />
      </div>
    </div>
  );
}
