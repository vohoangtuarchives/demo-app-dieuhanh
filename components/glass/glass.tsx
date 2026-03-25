import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return <Card className={cn("glass-card", className)}>{children}</Card>;
}

export function GlassPanel({ className, children }: { className?: string; children: ReactNode }) {
  return <Card className={cn("glass-panel p-4", className)}>{children}</Card>;
}

export function GlassStat({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <GlassCard className="border-white/40">
      <CardHeader className="p-4 pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {hint ? <CardContent className="p-4 pt-0 text-xs text-muted-foreground">{hint}</CardContent> : null}
    </GlassCard>
  );
}

export function GlassTableContainer({ children }: { children: ReactNode }) {
  return <Card className="glass-panel overflow-auto p-0">{children}</Card>;
}
