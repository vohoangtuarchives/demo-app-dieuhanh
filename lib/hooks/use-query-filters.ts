"use client";

import { useCallback, useMemo, useState } from "react";

export type QueryFilters = Record<string, string>;

export function useQueryFilters(initial: QueryFilters) {
  const [filters, setFilters] = useState<QueryFilters>(initial);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initial);
  }, [initial]);

  const setManyFilters = useCallback((next: QueryFilters) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.entries(filters).some(([key, value]) => key !== "search" ? value !== initial[key] : value.trim() !== ""),
    [filters, initial]
  );

  return {
    filters,
    updateFilter,
    setManyFilters,
    resetFilters,
    hasActiveFilters,
  };
}
