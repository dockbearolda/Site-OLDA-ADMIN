import Link from "next/link";

import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/container";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

import styles from "./contact-cta-section.module.css";

export function ContactCtaSection() {
  return (
    <section className={styles.section} id="contact">
      <Container>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Prise de contact</span>
            <h2 className={styles.title}>Demander le catalogue.</h2>
            <p className={styles.description}>
              Email, téléphone, ou demande de devis.
            </p>

            <div className={styles.actions}>
              <a
                className={styles.primaryAction}
                href={`mailto:${siteConfig.contact.email}?subject=Demande%20catalogue%20B2B`}
              >
                Demander le catalogue
              </a>
              <Link className={styles.secondaryAction} href="/catalogue">
                Revoir les familles
              </Link>
            </div>
          </div>

          <div className={styles.meta}>
            <MediaPlaceholder ratio="portrait" label="Photo contact" />

            <article className={styles.contactCard}>
              <span className={styles.cardTitle}>Coordonnées</span>
              <div className={styles.contactList}>
                <a
                  className={styles.contactRow}
                  href={`mailto:${siteConfig.contact.email}`}
                >
                  <span className={styles.contactLabel}>Email</span>
                  <span className={styles.contactValue}>
                    {siteConfig.contact.email}
                  </span>
                </a>
                <a
                  className={styles.contactRow}
                  href={`tel:${siteConfig.contact.phone}`}
                >
                  <span className={styles.contactLabel}>Téléphone</span>
                  <span className={styles.contactValue}>
                    {siteConfig.contact.phone}
                  </span>
                </a>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Zone</span>
                  <span className={styles.contactValue}>
                    {siteConfig.contact.location}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}
