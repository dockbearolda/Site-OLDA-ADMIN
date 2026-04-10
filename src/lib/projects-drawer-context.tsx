"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ProjectsDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ProjectsDrawerContext = createContext<ProjectsDrawerContextValue | null>(null);

export function ProjectsDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <ProjectsDrawerContext.Provider value={value}>
      {children}
    </ProjectsDrawerContext.Provider>
  );
}

export function useProjectsDrawer() {
  const ctx = useContext(ProjectsDrawerContext);
  if (!ctx) throw new Error("useProjectsDrawer must be used inside ProjectsDrawerProvider");
  return ctx;
}
