"use client";

import { useSession } from "next-auth/react";

import { useProjects } from "@/lib/projects-context";
import { useProjectsDrawer } from "@/lib/projects-drawer-context";
import styles from "./projects-nav-button.module.css";

export function ProjectsNavButton() {
  const { status } = useSession();
  const { savedProjects } = useProjects();
  const { open } = useProjectsDrawer();

  if (status !== "authenticated") return null;

  const count = savedProjects.length;

  return (
    <button
      className={styles.button}
      onClick={open}
      aria-label={`Mes projets sauvegardés${count > 0 ? ` (${count})` : ""}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
      <span className={styles.label}>Mes Projets</span>
      {count > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}
