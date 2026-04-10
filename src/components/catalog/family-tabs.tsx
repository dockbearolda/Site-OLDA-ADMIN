import Link from "next/link";

import { catalogFamilies } from "@/data/catalog";

import styles from "./family-tabs.module.css";

type FamilyTabsProps = {
  activeId?: string;
};

export function FamilyTabs({ activeId }: FamilyTabsProps) {
  return (
    <nav className={styles.nav} aria-label="Familles du catalogue">
      <div className={styles.list}>
        <Link
          className={`${styles.tab} ${!activeId ? styles.active : ""}`.trim()}
          href="/catalogue"
        >
          Tout
        </Link>

        {catalogFamilies.map((family) => (
          <Link
            key={family.id}
            className={`${styles.tab} ${
              activeId === family.id ? styles.active : ""
            }`.trim()}
            href={`/catalogue/${family.id}`}
          >
            {family.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
