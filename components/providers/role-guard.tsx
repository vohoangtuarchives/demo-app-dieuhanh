"use client";

import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import type { Role } from "@/lib/app-data";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Không có quyền truy cập</h2>
              <p className="mt-1 text-sm text-muted-foreground">Vai trò hiện tại không được phép thao tác màn hình này.</p>
            </div>
          </CardContent>
        </Card>
      )
    );
  }
  return <>{children}</>;
}
