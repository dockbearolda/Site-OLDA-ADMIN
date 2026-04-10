import { featuredReferences } from "@/data/catalog";
import { Container } from "@/components/ui/container";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { SectionHeading } from "@/components/ui/section-heading";

import styles from "./showcase-section.module.css";

export function ShowcaseSection() {
  return (
    <section className={styles.section} id="selection">
      <Container>
        <div className={styles.header}>
          <SectionHeading eyebrow="Sélection" title="Produits à mettre en avant." />
        </div>

        <div className={styles.grid}>
          {featuredReferences.map((reference) => {
            return (
              <article key={reference.ref} className={styles.card}>
                <MediaPlaceholder
                  ratio="square"
                  label={`Photo ${reference.ref}`}
                />

                <h3 className={styles.title}>{reference.label}</h3>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
