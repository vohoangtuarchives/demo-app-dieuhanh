import type { ReactNode } from "react";
import { FilterX } from "lucide-react";
import { FilterBar } from "@/components/backoffice/filter-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function UnifiedFilterBar({
  title,
  children,
  hasActiveFilters,
  onReset,
  rightActions,
}: {
  title: string;
  children: ReactNode;
  hasActiveFilters?: boolean;
  onReset?: () => void;
  rightActions?: ReactNode;
}) {
  return (
    <FilterBar
      title={title}
      actions={
        <div className="flex items-center gap-2">
          {hasActiveFilters && <Badge variant="info" className="gap-1 text-[11px]">Đang lọc</Badge>}
          {onReset && (
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs" onClick={onReset}>
              <FilterX className="size-3.5" />
              Clear filters
            </Button>
          )}
          {rightActions}
        </div>
      }
    >
      {children}
    </FilterBar>
  );
}
