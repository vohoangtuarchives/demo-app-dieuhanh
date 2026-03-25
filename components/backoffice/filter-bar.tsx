import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function FilterBar({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {actions}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">{children}</div>
      </CardContent>
    </Card>
  );
}
