"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Download,
  Eye,
  GitBranch,
  Globe,
  Map,
  TrendingUp,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { EmptyBlock } from "@/components/backoffice/state-block";
import { cn } from "@/lib/utils";

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
    code: "TN-HCM-24031", name: "Miền Tây 3N2Đ", type: "Trong nước", customerType: "Đoàn",
    branch: "HCM", dateRange: "24/03 - 26/03", pax: 35, operator: "Nguyễn Văn A",
    status: "Đang diễn ra", payment: "Đã cọc", booking: "Còn chưa xác nhận",
    revenue: 420000000, cost: 358000000, profit: 62000000,
  },
  {
    code: "QT-HN-24012", name: "Thái Lan 4N3Đ", type: "Quốc tế", customerType: "Lẻ",
    branch: "Hà Nội", dateRange: "28/03 - 31/03", pax: 19, operator: "Trần Thị B",
    status: "Đang dự toán", payment: "Chưa thanh toán", booking: "Chưa xác nhận",
    revenue: 510000000, cost: 441000000, profit: 69000000,
  },
  {
    code: "IB-CT-24008", name: "Mekong Discovery", type: "Inbound", customerType: "Đoàn",
    branch: "Cần Thơ", dateRange: "02/04 - 05/04", pax: 22, operator: "Lê Quốc C",
    status: "Bàn giao HDV", payment: "Đã thanh toán đủ", booking: "Đã xác nhận",
    revenue: 625000000, cost: 507000000, profit: 118000000,
  },
];

const tourCoverByCode: Record<string, string> = {
  "TN-HCM-24031": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
  "QT-HN-24012": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=60",
  "IB-CT-24008": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=60",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "info" | "secondary"> = {
  "Đang diễn ra": "success",
  "Đang dự toán": "warning",
  "Bàn giao HDV": "info",
};

const PAYMENT_VARIANT: Record<string, "danger" | "warning" | "success"> = {
  "Chưa thanh toán": "danger",
  "Đã cọc": "warning",
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
    const query = new URLSearchParams(filters);
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
          (filters.search.trim() === "" || row.code.toLowerCase().includes(filters.search.toLowerCase()) || row.name.toLowerCase().includes(filters.search.toLowerCase())),
      ),
    [filters],
  );

  const totals = useMemo(() => {
    const revenue = filteredRows.reduce((sum, row) => sum + row.revenue, 0);
    const cost = filteredRows.reduce((sum, row) => sum + row.cost, 0);
    const pax = filteredRows.reduce((sum, row) => sum + row.pax, 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { totalTours: filteredRows.length, revenue, cost, profit, pax, margin };
  }, [filteredRows]);

  return (
    <>
      {/* Page header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Map className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Quản lý Tour</h2>
              <p className="text-sm text-muted-foreground">Danh sách tour đang điều hành theo chi nhánh, loại tour và trạng thái.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          { label: "Tổng tour", value: totals.totalTours, sub: `${totals.pax} pax`, icon: Map, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
          { label: "Doanh thu", value: totals.revenue.toLocaleString("vi-VN"), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
          { label: "Chi phí", value: totals.cost.toLocaleString("vi-VN"), icon: Users, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
          { label: "Lợi nhuận", value: totals.profit.toLocaleString("vi-VN"), sub: `${totals.margin}% margin`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
        ] as const).map((stat) => (
          <div key={stat.label} className={cn("rounded-xl border p-4", stat.border, stat.bg)}>
            <div className="flex items-center justify-between">
              <p className={cn("text-xs font-medium", stat.color)}>{stat.label}</p>
              <stat.icon className={cn("size-4", stat.color)} />
            </div>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight tabular-nums", stat.color)}>{stat.value}</p>
            {stat.sub && <p className="mt-1 text-[11px] text-muted-foreground">{stat.sub}</p>}
          </div>
        ))}
      </section>

      <UnifiedFilterBar
        title="List Tour"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        rightActions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <UserCog className="size-3.5" />
              Bulk assign NVĐH
            </Button>
          </div>
        }
      >
        <NativeSelect className="w-full" value={filters.branch} onChange={(e) => updateFilter("branch", e.target.value)}>
          <option>Tất cả chi nhánh</option><option>HCM</option><option>Hà Nội</option><option>Cần Thơ</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.tourType} onChange={(e) => updateFilter("tourType", e.target.value)}>
          <option>Tất cả loại tour</option><option>Trong nước</option><option>Quốc tế</option><option>Inbound</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.customerType} onChange={(e) => updateFilter("customerType", e.target.value)}>
          <option>Tất cả loại khách</option><option>Lẻ</option><option>Đoàn</option>
        </NativeSelect>
        <Input className="bg-card/80" placeholder="Tìm mã/tên tour" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả trạng thái</option><option>Đang diễn ra</option><option>Đang dự toán</option><option>Bàn giao HDV</option>
        </NativeSelect>
      </UnifiedFilterBar>

      {/* Tour cards */}
      <section className="space-y-4">
        {filteredRows.length === 0 ? (
          <EmptyBlock message="Không có tour phù hợp với bộ lọc hiện tại." />
        ) : (
          filteredRows.map((row) => {
            const cover = tourCoverByCode[row.code] ?? tourCoverByCode["TN-HCM-24031"];
            const profitMargin = row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0;
            return (
              <Card key={row.code} className="overflow-hidden p-0 transition-shadow hover:shadow-md">
                <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                  {/* Image side */}
                  <div className="relative h-[261px] w-full md:h-[261px] md:w-[280px]">
                    <img src={cover} alt={row.name} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur-sm font-mono">
                        {row.code}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-lg font-bold text-white drop-shadow-sm">{row.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                          <GitBranch className="size-3" />{row.branch}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                          <Globe className="size-3" />{row.type}
                        </span>
                        <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                          {row.customerType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="flex flex-col">
                    {/* Top: badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 md:px-5">
                      <div className="flex items-center gap-1.5">
                        <Badge className="px-2 py-0.5 text-[11px]" variant={STATUS_VARIANT[row.status] ?? "secondary"}>{row.status}</Badge>
                        <Badge className="px-2 py-0.5 text-[11px]" variant={PAYMENT_VARIANT[row.payment] ?? "success"}>{row.payment}</Badge>
                      </div>
                      <Badge variant={row.booking === "Đã xác nhận" ? "success" : "outline"} className="px-2 py-0.5 text-[11px]">
                        {row.booking}
                      </Badge>
                    </div>

                    {/* Middle: info grid */}
                    <div className="flex-1 px-4 py-4 md:px-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CalendarDays className="size-3" />Ngày KH-KT
                          </p>
                          <p className="mt-0.5 text-sm font-semibold">{row.dateRange}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Users className="size-3" />Số khách
                          </p>
                          <p className="mt-0.5 text-sm font-semibold">{row.pax}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <UserRound className="size-3" />NVĐH
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold">{row.operator}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <TrendingUp className="size-3" />Margin
                          </p>
                          <p className={cn("mt-0.5 text-sm font-semibold", profitMargin >= 15 ? "text-emerald-600" : "text-amber-600")}>
                            {profitMargin}%
                          </p>
                        </div>
                      </div>

                      {/* Financial row */}
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Doanh thu</p>
                          <p className="mt-0.5 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                            {row.revenue.toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Chi phí</p>
                          <p className="mt-0.5 text-sm font-bold tabular-nums">{row.cost.toLocaleString("vi-VN")}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Lợi nhuận</p>
                          <p className="mt-0.5 text-sm font-bold tabular-nums text-primary">{row.profit.toLocaleString("vi-VN")}</p>
                        </div>
                      </div>

                      {/* Profit margin bar */}
                      <div className="mt-2">
                        <Progress value={profitMargin} className="h-1.5" />
                      </div>
                    </div>

                    {/* Bottom: actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5 md:px-5">
                      <Link href={`/tours/${row.code}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Eye className="size-3.5" />
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Link href={`/tours/${row.code}/estimate`}>
                        <Button size="sm" className="gap-1.5 text-xs">
                          <Map className="size-3.5" />
                          Mở step hiện tại
                        </Button>
                      </Link>
                      <Link href={`/tours/${row.code}`} className="ml-auto">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-primary">
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </>
  );
}
