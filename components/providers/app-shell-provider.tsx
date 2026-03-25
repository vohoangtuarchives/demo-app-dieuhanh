"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { BRANCHES, type Role } from "@/lib/app-data";

type AppShellContextType = {
  branch: string;
  setBranch: (value: string) => void;
  role: Role;
  setRole: (value: Role) => void;
};

const AppShellContext = createContext<AppShellContextType | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [role, setRole] = useState<Role>("OPS");

  const value = useMemo(() => ({ branch, setBranch, role, setRole }), [branch, role]);
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return ctx;
}
