import type { ReactNode } from "react";
import { AppShellProvider } from "@/components/providers/app-shell-provider";
import { AppShell } from "@/components/backoffice/app-shell";

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return (
    <AppShellProvider>
      <AppShell>{children}</AppShell>
    </AppShellProvider>
  );
}
