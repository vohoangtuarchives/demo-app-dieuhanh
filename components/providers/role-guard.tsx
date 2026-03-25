"use client";

import type { ReactNode } from "react";
import type { Role } from "@/lib/app-data";
import { PlPanel } from "@/components/preline/layout-primitives";
import { useAppShell } from "./app-shell-provider";

export function RoleGuard({
  allow,
  fallback,
  children,
}: {
  allow: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { role } = useAppShell();
  if (!allow.includes(role)) {
    return (
      fallback ?? (
        <PlPanel className="p-6">
          <h2 className="text-lg font-semibold">Không có quyền truy cập</h2>
          <p className="mt-2 text-sm text-muted-foreground">Vai trò hiện tại không được phép thao tác màn hình này.</p>
        </PlPanel>
      )
    );
  }
  return <>{children}</>;
}
