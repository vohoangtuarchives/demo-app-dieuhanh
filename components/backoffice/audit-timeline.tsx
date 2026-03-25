import { ArrowRight, Clock } from "lucide-react";
import type { WorkflowAction } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";

export function AuditTimeline({ items }: { items: WorkflowAction[] }) {
  return (
    <div className="relative space-y-0">
      {items.map((item, idx) => (
        <div key={`${item.from}-${item.to}-${item.at}`} className="group relative flex gap-3 pb-4 last:pb-0">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary">
              <ArrowRight className="size-3" />
            </div>
            {idx < items.length - 1 && <div className="w-px flex-1 bg-border" />}
          </div>
          {/* Content */}
          <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/70 p-3 transition-colors group-hover:bg-muted/40">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info" className="text-[10px]">{item.actor}</Badge>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                {item.at}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
              <span className="text-muted-foreground">{item.from}</span>
              <ArrowRight className="size-3.5 text-primary" />
              <span>{item.to}</span>
            </p>
            {item.note && <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
