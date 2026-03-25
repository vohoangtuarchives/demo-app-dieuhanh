import type { WorkflowAction } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";

export function AuditTimeline({ items }: { items: WorkflowAction[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={`${item.from}-${item.to}-${item.at}`} className="rounded-lg border bg-card/70 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{item.at}</span>
            <Badge variant="info">{item.actor}</Badge>
          </div>
          <p className="mt-1 text-sm font-medium">{`${item.from} -> ${item.to}`}</p>
          {item.note ? <p className="mt-1 text-xs text-muted-foreground">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
