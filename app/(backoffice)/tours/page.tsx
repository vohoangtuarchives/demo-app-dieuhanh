"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { PlStat } from "@/components/preline/layout-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { CalendarDays, Users, UserRound, Eye, GitBranch, Globe } from "lucide-react";

type TourRow = {
  code: string;
  name: string;
  type: string;
  customerType: string;
  branch: string;
  dateRange: string;
  pax: number;
  operator: string;
  status: string;
  payment: string;
  booking: string;
  revenue: number;
  cost: number;
  profit: number;
};

const tourRows: TourRow[] = [
  {
    code: "TN-HCM-24031",
    name: "Miền Tây 3N2Đ",
    type: "Trong nước",
    customerType: "Đoàn",
    branch: "HCM",
    dateRange: "24/03 - 26/03",
    pax: 35,
    operator: "Nguyễn Văn A",
    status: "Đang diễn ra",
    payment: "Đã cọc",
    booking: "Còn chưa xác nhận",
    revenue: 420000000,
    cost: 358000000,
    profit: 62000000,
  },
  {
    code: "QT-HN-24012",
    name: "Thái Lan 4N3Đ",
    type: "Quốc tế",
    customerType: "Lẻ",
    branch: "Hà Nội",
    dateRange: "28/03 - 31/03",
    pax: 19,
    operator: "Trần Thị B",
    status: "Đang dự toán",
    payment: "Chưa thanh toán",
    booking: "Chưa xác nhận",
    revenue: 510000000,
    cost: 441000000,
    profit: 69000000,
  },
  {
    code: "IB-CT-24008",
    name: "Mekong Discovery",
    type: "Inbound",
    customerType: "Đoàn",
    branch: "Cần Thơ",
    dateRange: "02/04 - 05/04",
    pax: 22,
    operator: "Lê Quốc C",
    status: "Bàn giao HDV",
    payment: "Đã thanh toán đủ",
    booking: "Đã xác nhận",
    revenue: 625000000,
    cost: 507000000,
    profit: 118000000,
  },
];

const tourCoverByCode: Record<string, string> = {
  "TN-HCM-24031":
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
  "QT-HN-24012":
    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=60",
  "IB-CT-24008":
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=60",
};

export default function ToursPage() {
  const { filters, updateFilter, setManyFilters, resetFilters, hasActiveFilters } = useQueryFilters({
    branch: "Tất cả chi nhánh",
    tourType: "Tất cả loại tour",
    customerType: "Tất cả loại khách",
    status: "Tất cả trạng thái",
    page: "1",
    sort: "startDate_desc",
    search: "",
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      branch: params.get("branch") ?? "Tất cả chi nhánh",
      tourType: params.get("tourType") ?? "Tất cả loại tour",
      customerType: params.get("customerType") ?? "Tất cả loại khách",
      status: params.get("status") ?? "Tất cả trạng thái",
      page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "startDate_desc",
      search: params.get("search") ?? "",
    });
  }, [setManyFilters]);
  useEffect(() => {
    const query = new URLSearchParams({
      branch: filters.branch,
      tourType: filters.tourType,
      customerType: filters.customerType,
      status: filters.status,
      page: filters.page,
      sort: filters.sort,
      search: filters.search,
    });
    window.history.replaceState({}, "", `/tours?${query.toString()}`);
  }, [filters]);
  const filteredRows = useMemo(
    () =>
      tourRows.filter(
        (row) =>
          (filters.branch === "Tất cả chi nhánh" || row.branch === filters.branch) &&
          (filters.tourType === "Tất cả loại tour" || row.type === filters.tourType) &&
          (filters.customerType === "Tất cả loại khách" || row.customerType === filters.customerType) &&
          (filters.status === "Tất cả trạng thái" || row.status === filters.status) &&
          (filters.search.trim() === "" || row.code.toLowerCase().includes(filters.search.toLowerCase()) || row.name.toLowerCase().includes(filters.search.toLowerCase()))
      ),
    [filters]
  );

  const totals = useMemo(() => {
    const revenue = filteredRows.reduce((sum, row) => sum + row.revenue, 0);
    const cost = filteredRows.reduce((sum, row) => sum + row.cost, 0);
    return { totalTours: filteredRows.length, revenue, cost, profit: revenue - cost };
  }, [filteredRows]);

  const statusVariant = (status: string) => {
    if (status === "Đang diễn ra") return "success" as const;
    if (status === "Đang dự toán") return "warning" as const;
    if (status === "Bàn giao HDV") return "info" as const;
    return "secondary" as const;
  };
  const paymentVariant = (payment: string) => {
    if (payment === "Chưa thanh toán") return "danger" as const;
    if (payment === "Đã cọc") return "warning" as const;
    return "success" as const;
  };

  return (
    <>
      <section className="grid gap-3 md:grid-cols-4">
        <PlStat title="Tổng tour" value={totals.totalTours} />
        <PlStat title="Doanh thu dự kiến" value={totals.revenue.toLocaleString("vi-VN")} />
        <PlStat title="Chi phí dự kiến" value={totals.cost.toLocaleString("vi-VN")} />
        <PlStat title="Lợi nhuận dự kiến" value={totals.profit.toLocaleString("vi-VN")} />
      </section>

      <UnifiedFilterBar
        title="List Tour"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        rightActions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button size="sm">Bulk assign NVĐH</Button>
          </div>
        }
      >
        <NativeSelect className="w-full" value={filters.branch} onChange={(e) => updateFilter("branch", e.target.value)}>
          <option>Tất cả chi nhánh</option>
          <option>HCM</option>
          <option>Hà Nội</option>
          <option>Cần Thơ</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.tourType} onChange={(e) => updateFilter("tourType", e.target.value)}>
          <option>Tất cả loại tour</option>
          <option>Trong nước</option>
          <option>Quốc tế</option>
          <option>Inbound</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.customerType} onChange={(e) => updateFilter("customerType", e.target.value)}>
          <option>Tất cả loại khách</option>
          <option>Lẻ</option>
          <option>Đoàn</option>
        </NativeSelect>
        <Input
          className="bg-card/80 backdrop-blur-sm"
          placeholder="Tìm mã/tên tour"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
        <NativeSelect className="w-full" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả trạng thái</option>
          <option>Đang diễn ra</option>
          <option>Đang dự toán</option>
          <option>Bàn giao HDV</option>
        </NativeSelect>
      </UnifiedFilterBar>

      <section className="space-y-4">
        {filteredRows.map((row) => {
          const cover = tourCoverByCode[row.code] ?? tourCoverByCode["TN-HCM-24031"];
          return (
            <div
              key={row.code}
              className="overflow-hidden rounded-xl border border-border bg-layer shadow-sm dark:shadow-none"
            >
              <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                <div className="relative h-[260px] w-full md:h-[260px] md:w-[280px]">
                  <img
                    src={cover}
                    alt={row.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60">
                      {row.code}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-foreground">{row.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-foreground/90">
                          <GitBranch className="size-3.5 text-muted-foreground" aria-hidden />
                          {row.branch}
                        </span>
                        <span className="inline-flex rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-foreground/90">
                          {row.customerType}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-foreground/90">
                          <Globe className="size-3.5 text-muted-foreground" aria-hidden />
                          {row.type}
                        </span>
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <Badge className="px-2.5 py-1" variant={statusVariant(row.status)}>{row.status}</Badge>
                      <Badge className="px-2.5 py-1" variant={paymentVariant(row.payment)}>{row.payment}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">Ngày KH-KT</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                        {row.dateRange}
                      </p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-xs text-muted-foreground">Số khách</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <Users className="size-4 text-muted-foreground" aria-hidden />
                        {row.pax}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">NVĐH</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <UserRound className="size-4 text-muted-foreground" aria-hidden />
                        {row.operator}
                      </p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-xs text-muted-foreground">Phiếu DV</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{row.booking}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">Doanh thu</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {row.revenue.toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">Chi phí</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{row.cost.toLocaleString("vi-VN")}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">Lợi nhuận</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{row.profit.toLocaleString("vi-VN")}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/tours/${row.code}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Eye className="size-4" aria-hidden />
                        Xem chi tiết
                      </Link>
                      <Link
                        href={`/tours/${row.code}/estimate`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <GitBranch className="size-4" aria-hidden />
                        Mở step hiện tại
                      </Link>
                    </div>

                    <span className="text-xs text-muted-foreground"> </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
