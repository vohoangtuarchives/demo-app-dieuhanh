import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Panel / section — padding mặc định như GlassPanel cũ (p-4) */
export function PlPanel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-layer p-4 text-foreground shadow-sm dark:shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Card nhỏ — block con trong dashboard */
export function PlCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background/80 text-foreground shadow-sm dark:bg-layer",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Vùng bảng: viền + bo góc như bảng Preline */
export function PlTableShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border bg-layer shadow-sm dark:shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PlStat({
  title,
  value,
  hint,
  className,
}: {
  title: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <PlCard className={cn("p-4", className)}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </PlCard>
  );
}
