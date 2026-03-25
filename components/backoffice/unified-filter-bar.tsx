import type { ReactNode } from "react";
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
          {hasActiveFilters ? <Badge variant="info">Đang lọc</Badge> : null}
          {onReset ? (
            <Button variant="secondary" size="sm" onClick={onReset}>
              Clear filters
            </Button>
          ) : null}
          {rightActions}
        </div>
      }
    >
      {children}
    </FilterBar>
  );
}
