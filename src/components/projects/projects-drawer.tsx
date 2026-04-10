"use client";

import { useEffect } from "react";

import { useProjects, type SavedProject } from "@/lib/projects-context";
import { useProjectsDrawer } from "@/lib/projects-drawer-context";
import styles from "./projects-drawer.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function totalQuantity(items: SavedProject["items"]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

type ProjectCardProps = {
  project: SavedProject;
  onLoad: () => void;
  onDelete: () => void;
};

function ProjectCard({ project, onLoad, onDelete }: ProjectCardProps) {
  const qty = totalQuantity(project.items);
  const previewRefs = project.items
    .slice(0, 3)
    .map((i) => i.ref)
    .join(", ");
  const overflow = project.items.length > 3 ? ` +${project.items.length - 3}` : "";

  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <span className={styles.cardName}>{project.name}</span>
          <span className={styles.cardDate}>{formatDate(project.date)}</span>
        </div>
        <button
          className={styles.cardDeleteBtn}
          onClick={onDelete}
          aria-label={`Supprimer « ${project.name} »`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      <p className={styles.cardSummary}>
        <span className={styles.cardCount}>
          {qty}&nbsp;article{qty > 1 ? "s" : ""}
        </span>
        <span className={styles.cardRefs} title={project.items.map((i) => i.ref).join(", ")}>
          {previewRefs}{overflow}
        </span>
      </p>

      <button className={styles.resumeBtn} onClick={onLoad}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
        Reprendre cette commande
      </button>
    </li>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon} aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M52 52H12a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4h12l4 6h24a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4Z" />
          <line x1="32" y1="30" x2="32" y2="42" />
          <line x1="26" y1="36" x2="38" y2="36" />
        </svg>
      </div>
      <p className={styles.emptyTitle}>Aucun projet sauvegardé</p>
      <p className={styles.emptyHint}>
        Construisez un devis, puis cliquez sur{" "}
        <strong>Sauvegarder comme brouillon</strong>{" "}
        pour le retrouver ici.
      </p>
    </div>
  );
}

// ─── ProjectsDrawer ───────────────────────────────────────────────────────────

export function ProjectsDrawer() {
  const { isOpen, close } = useProjectsDrawer();
  const { savedProjects, loadProject, deleteProject } = useProjects();

  // ESC + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const handleLoad = (id: string) => {
    loadProject(id);
    close();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mes Projets Sauvegardés"
      >
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <div className={styles.panelIconWrap} aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 className={styles.panelTitle}>Mes Projets</h2>
              <p className={styles.panelSubtitle}>
                {savedProjects.length > 0
                  ? `${savedProjects.length} brouillon${savedProjects.length > 1 ? "s" : ""} en attente`
                  : "Vos paniers mis en pause"}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={close} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.panelBody}>
          {savedProjects.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className={styles.projectList} role="list">
              {savedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onLoad={() => handleLoad(project.id)}
                  onDelete={() => deleteProject(project.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
