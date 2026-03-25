import { AlertTriangle, Bell, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AlertItem = {
  title: string;
  level: "danger" | "warning" | "info";
  owner: string;
  due: string;
};

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; dot: string; text: string }> = {
  danger: { icon: AlertTriangle, dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  warning: { icon: Bell, dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  info: { icon: Info, dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
};

export function AlertCenter({ items }: { items: AlertItem[] }) {
  return (
    <div className="relative space-y-0">
      {items.map((item, idx) => {
        const cfg = LEVEL_CONFIG[item.level] ?? LEVEL_CONFIG.info;
        return (
          <div key={`${item.title}-${item.owner}`} className="group relative flex gap-3 pb-4 last:pb-0">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={cn("mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-background", cfg.dot)} />
              {idx < items.length - 1 && <div className="w-px flex-1 bg-border" />}
            </div>
            {/* Content */}
            <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/70 p-3 transition-colors group-hover:bg-muted/40">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <cfg.icon className={cn("size-3.5 shrink-0", cfg.text)} />
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                <Badge variant={item.level} className="shrink-0 text-[10px]">{item.level.toUpperCase()}</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Phụ trách: <span className="font-medium text-foreground">{item.owner}</span></span>
                <span className="text-border">|</span>
                <span>Hạn: <span className="font-medium tabular-nums text-foreground">{item.due}</span></span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
