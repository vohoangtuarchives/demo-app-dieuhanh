import { Badge } from "@/components/ui/badge";

type AlertItem = {
  title: string;
  level: "danger" | "warning" | "info";
  owner: string;
  due: string;
};

export function AlertCenter({ items }: { items: AlertItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={`${item.title}-${item.owner}`} className="rounded-lg border bg-card/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{item.title}</p>
            <Badge variant={item.level}>{item.level.toUpperCase()}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Phụ trách: {item.owner} | Hạn xử lý: {item.due}
          </p>
        </div>
      ))}
    </div>
  );
}
