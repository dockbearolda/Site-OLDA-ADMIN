"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CartItem } from "./cart-context";
import { useCart } from "./cart-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavedProject = {
  /** Identifiant unique généré côté client. */
  id: string;
  /** Nom libre donné par l'acheteur (ex. "Goodies Noël 2026"). */
  name: string;
  /** Date de sauvegarde — chaîne ISO 8601. */
  date: string;
  /** Snapshot du panier au moment de la sauvegarde. */
  items: CartItem[];
};

type ProjectsContextValue = {
  savedProjects: SavedProject[];
  /**
   * Sauvegarde le panier actif sous `name`, puis vide le panier.
   * No-op si le panier est vide.
   */
  saveCurrentCart: (name: string) => void;
  /**
   * Remplace le panier actif par le projet `id` et retire ce projet
   * de la liste des brouillons.
   */
  loadProject: (id: string) => void;
  /** Supprime définitivement un brouillon sans le charger. */
  deleteProject: (id: string) => void;
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "olda-projects";

function loadFromStorage(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedProject[]) : [];
  } catch {
    return [];
  }
}

function persistToStorage(projects: SavedProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    /* quota exceeded — silent */
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const { items, clear, replace } = useCart();

  // Hydration depuis localStorage (côté client uniquement)
  useEffect(() => {
    setSavedProjects(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persistance sur chaque mutation
  useEffect(() => {
    if (hydrated) persistToStorage(savedProjects);
  }, [savedProjects, hydrated]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const saveCurrentCart = useCallback(
    (name: string) => {
      if (items.length === 0) return;

      const project: SavedProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || "Projet sans titre",
        date: new Date().toISOString(),
        items: items.map((i) => ({ ...i })), // deep-copy snapshot
      };

      setSavedProjects((prev) => [project, ...prev]);
      clear();
    },
    [items, clear],
  );

  const loadProject = useCallback(
    (id: string) => {
      const project = savedProjects.find((p) => p.id === id);
      if (!project) return;

      replace(project.items);
      setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [savedProjects, replace],
  );

  const deleteProject = useCallback((id: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Value ────────────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({ savedProjects, saveCurrentCart, loadProject, deleteProject }),
    [savedProjects, saveCurrentCart, loadProject, deleteProject],
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
  return ctx;
}
