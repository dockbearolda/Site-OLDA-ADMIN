import { processSteps } from "@/data/catalog";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

import styles from "./process-section.module.css";

export function ProcessSection() {
  return (
    <section className={styles.section} id="methode">
      <Container>
        <div className={styles.header}>
          <SectionHeading eyebrow="Méthode" title="Parcours." />
        </div>

        <div className={styles.grid}>
          {processSteps.map((step) => (
            <article key={step.number} className={styles.card}>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.title}>{step.title}</h3>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
