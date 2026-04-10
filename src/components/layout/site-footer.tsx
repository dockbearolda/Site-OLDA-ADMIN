import Link from "next/link";

import { catalogFamilies, catalogSummary } from "@/data/catalog";
import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/container";

import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.panel}>
          <div className={styles.brandBlock}>
            <div className={styles.brandLockup}>
              <span className={styles.brandMark}>O</span>
              <span className={styles.brandName}>{siteConfig.name}</span>
            </div>

            <div className={styles.metaStrip}>
              <span className={styles.metaPill}>
                {catalogSummary.totalReferences}+ références
              </span>
              <span className={styles.metaPill}>
                {catalogSummary.totalFamilies} familles
              </span>
              <span className={styles.metaPill}>
                {catalogSummary.minimumOrderHint}
              </span>
            </div>

            <p className={styles.copyright}>
              © {new Date().getFullYear()} {siteConfig.name}
            </p>
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Navigation</span>
            <div className={styles.linkList}>
              {siteConfig.navigation.map((item) => (
                <Link key={item.href} className={styles.link} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Familles</span>
            <div className={styles.linkList}>
              {catalogFamilies.map((family) => (
                <Link
                  key={family.id}
                  className={styles.link}
                  href={`/catalogue/${family.id}`}
                >
                  {family.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.column}>
            <span className={styles.columnTitle}>Contact</span>
            <div className={styles.linkList}>
              <a className={styles.link} href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>
              <a className={styles.link} href={`tel:${siteConfig.contact.phone}`}>
                {siteConfig.contact.phone}
              </a>
              <span className={styles.contactText}>{siteConfig.contact.location}</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
