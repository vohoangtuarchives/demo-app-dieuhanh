"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FileWarning,
  MapPin,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Upload,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { type BookingLifecycle } from "@/lib/service-lifecycle";
import { cn } from "@/lib/utils";

type Booking = {
  code: string;
  createdDate: string;
  tourCode: string;
  tourName: string;
  serviceType: string;
  supplier: string;
  useDate: string;
  totalValue: number;
  status: BookingLifecycle;
  hasConfirmFile: boolean;
  deletedAt?: string;
};

const initialRows: Booking[] = [
  { code: "BK-1203", createdDate: "21/03/2026", tourCode: "TN-HCM-24031", tourName: "Miền Tây 3N2Đ", serviceType: "Nhà hàng", supplier: "Ẩm Thực Sông Nước", useDate: "25/03/2026", totalValue: 26000000, status: "CONFIRMED", hasConfirmFile: true },
  { code: "BK-1204", createdDate: "22/03/2026", tourCode: "QT-HN-24012", tourName: "Thái Lan 4N3Đ", serviceType: "Khách sạn", supplier: "Bangkok Stay", useDate: "28/03/2026", totalValue: 143000000, status: "SENT", hasConfirmFile: false },
];

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "secondary"; icon: React.ElementType }> = {
  CONFIRMED: { label: "Đã xác nhận", variant: "success", icon: CheckCircle2 },
  PARTIAL_CONFIRMED: { label: "XN một phần", variant: "warning", icon: Clock },
  SENT: { label: "Đã gửi NCC", variant: "info", icon: Send },
  CANCELLED: { label: "Đã hủy", variant: "danger", icon: XCircle },
};

export default function BookingsPage() {
  const { filters, updateFilter, setManyFilters, resetFilters, hasActiveFilters } = useQueryFilters({
    serviceType: "Tất cả", status: "Tất cả", supplier: "Tất cả", page: "1", sort: "createdDate_desc", search: "",
  });
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      serviceType: params.get("serviceType") ?? "Tất cả", status: params.get("status") ?? "Tất cả",
      supplier: params.get("supplier") ?? "Tất cả", page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "createdDate_desc", search: params.get("search") ?? "",
    });
  }, [setManyFilters]);

  useEffect(() => {
    const params = new URLSearchParams(filters);
    window.history.replaceState({}, "", `/bookings?${params.toString()}`);
  }, [filters]);

  const tryConfirm = (code: string) => {
    setRows((prev) => prev.map((row) => {
      if (row.code !== code) return row;
      return { ...row, status: row.hasConfirmFile ? "CONFIRMED" : "PARTIAL_CONFIRMED" };
    }));
  };
  const markSent = (code: string) => setRows((prev) => prev.map((row) => (row.code === code ? { ...row, status: "SENT" } : row)));
  const cancelBooking = (code: string) => setRows((prev) => prev.map((row) => (row.code === code ? { ...row, status: "CANCELLED" } : row)));
  const uploadFile = (code: string) => setRows((prev) => prev.map((row) => (row.code === code ? { ...row, hasConfirmFile: true } : row)));
  const softDelete = (code: string) => setRows((prev) => prev.map((row) => (row.code === code ? { ...row, deletedAt: new Date().toLocaleString("vi-VN") } : row)));

  const filteredRows = rows.filter((row) => {
    if (row.deletedAt) return false;
    const byStatus = filters.status === "Tất cả" || row.status === filters.status;
    const bySupplier = filters.supplier === "Tất cả" || row.supplier === filters.supplier;
    const bySearch = filters.search.trim() === "" || row.code.toLowerCase().includes(filters.search.toLowerCase()) || row.tourCode.toLowerCase().includes(filters.search.toLowerCase());
    return byStatus && bySupplier && bySearch;
  });
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (filters.sort === "createdDate_asc") return a.createdDate.localeCompare(b.createdDate);
    if (filters.sort === "createdDate_desc") return b.createdDate.localeCompare(a.createdDate);
    if (filters.sort === "total_asc") return a.totalValue - b.totalValue;
    if (filters.sort === "total_desc") return b.totalValue - a.totalValue;
    return 0;
  });
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pagedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const summary = useMemo(() => ({
    confirmed: filteredRows.filter((r) => r.status === "CONFIRMED").length,
    pending: filteredRows.filter((r) => r.status !== "CONFIRMED" && r.status !== "CANCELLED").length,
    missingFile: filteredRows.filter((r) => !r.hasConfirmFile).length,
    totalValue: filteredRows.reduce((s, r) => s + r.totalValue, 0),
  }), [filteredRows]);

  return (
    <>
      {/* Page header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Quản lý Phiếu đặt DV</h2>
              <p className="text-sm text-muted-foreground">Theo dõi phiếu đặt dịch vụ, trạng thái xác nhận và file đính kèm.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          { label: "Đã xác nhận", value: summary.confirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", filterKey: "CONFIRMED" },
          { label: "Chờ xử lý", value: summary.pending, icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", filterKey: "SENT" },
          { label: "Thiếu file xác nhận", value: summary.missingFile, icon: FileWarning, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", filterKey: "" },
          { label: "Tổng giá trị", value: summary.totalValue.toLocaleString("vi-VN"), icon: FileText, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", filterKey: "" },
        ] as const).map((stat) => {
          const isActive = stat.filterKey && filters.status === stat.filterKey;
          const clickable = !!stat.filterKey;
          return (
            <button
              key={stat.label}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && updateFilter("status", isActive ? "Tất cả" : stat.filterKey)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                isActive
                  ? `${stat.border} ${stat.bg} ring-2 ring-current/10`
                  : clickable
                    ? "border-border bg-card hover:shadow-sm"
                    : `${stat.border} ${stat.bg}`,
                clickable && "cursor-pointer",
                !clickable && "cursor-default",
              )}
            >
              <div className="flex items-center justify-between">
                <p className={cn("text-xs font-medium", isActive || !clickable ? stat.color : "text-muted-foreground")}>{stat.label}</p>
                <stat.icon className={cn("size-4", isActive || !clickable ? stat.color : "text-muted-foreground/60")} />
              </div>
              <p className={cn("mt-1 text-2xl font-bold tracking-tight tabular-nums", isActive || !clickable ? stat.color : "text-foreground")}>{stat.value}</p>
              {clickable && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {isActive ? "Nhấn để bỏ lọc" : "Nhấn để lọc"}
                </p>
              )}
            </button>
          );
        })}
      </section>

      <UnifiedFilterBar
        title="List Phiếu đặt DV"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        rightActions={
          <Link href="/bookings/new">
            <Button size="sm" className="gap-1.5"><Plus className="size-3.5" />Tạo phiếu DV</Button>
          </Link>
        }
      >
        <NativeSelect className="w-full" value={filters.serviceType} onChange={(e) => updateFilter("serviceType", e.target.value)}>
          <option>Tất cả</option><option>Nhà hàng</option><option>Khách sạn</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả</option><option>SENT</option><option>PARTIAL_CONFIRMED</option><option>CONFIRMED</option><option>CANCELLED</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.supplier} onChange={(e) => updateFilter("supplier", e.target.value)}>
          <option>Tất cả</option><option>Bangkok Stay</option><option>Ẩm Thực Sông Nước</option>
        </NativeSelect>
        <Input className="bg-card/80" placeholder="Tìm mã phiếu/mã tour" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="createdDate_desc">Ngày tạo giảm dần</option><option value="createdDate_asc">Ngày tạo tăng dần</option>
          <option value="total_desc">Giá trị giảm dần</option><option value="total_asc">Giá trị tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      {/* Booking cards */}
      <section className="space-y-4">
        {pagedRows.map((row) => {
          const meta = STATUS_META[row.status] ?? { label: row.status, variant: "secondary" as const, icon: Clock };
          return (
            <Card key={row.code} className="p-0 transition-shadow hover:shadow-md">
              <CardContent className="p-0">
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 md:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-md font-mono text-xs">{row.code}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />{row.tourCode}
                    </span>
                    <span className="text-sm font-semibold">{row.tourName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={meta.variant} className="gap-1 rounded-md px-2 py-0.5 text-[11px]">
                      <meta.icon className="size-3" />
                      {meta.label}
                    </Badge>
                    <Badge
                      variant={row.hasConfirmFile ? "success" : "outline"}
                      className={cn("rounded-md px-2 py-0.5 text-[11px]", !row.hasConfirmFile && "border-amber-300 text-amber-600")}
                    >
                      {row.hasConfirmFile ? "Đã upload" : "Thiếu file"}
                    </Badge>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 py-4 md:px-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <BriefcaseBusiness className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Loại DV:</span>
                          <span className="font-medium">{row.serviceType}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <UserRound className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">NCC:</span>
                          <span className="font-medium">{row.supplier}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarDays className="size-3" />Ngày tạo</p>
                          <p className="mt-0.5 text-sm font-semibold">{row.createdDate}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarDays className="size-3" />Ngày sử dụng</p>
                          <p className="mt-0.5 text-sm font-semibold">{row.useDate}</p>
                        </div>
                      </div>
                    </div>
                    {/* Value */}
                    <div className="flex flex-col items-end justify-center lg:min-w-[160px]">
                      <p className="text-2xl font-bold tabular-nums">{row.totalValue.toLocaleString("vi-VN")}</p>
                      <p className="text-[11px] text-muted-foreground">Tổng giá trị</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5 md:px-5">
                  <Link href={`/tours/${row.tourCode}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Eye className="size-3.5" />Xem tour</Button>
                  </Link>
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs" onClick={() => markSent(row.code)}>
                    <Send className="size-3.5" />Gửi NCC
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs" onClick={() => uploadFile(row.code)}>
                    <Upload className="size-3.5" />Upload file
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs" onClick={() => tryConfirm(row.code)}>
                    <RefreshCw className="size-3.5" />Cập nhật
                  </Button>
                  <div className="ml-auto flex gap-1.5">
                    <Button variant="destructive" size="sm" className="gap-1.5 text-xs" onClick={() => cancelBooking(row.code)}>
                      <X className="size-3.5" />Hủy
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => softDelete(row.code)}>
                      <Trash2 className="size-3.5" />Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {totalPages > 1 && (
        <Card className="p-0">
          <CardContent className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-muted-foreground">Trang {page}/{totalPages} — {sortedRows.length} bản ghi</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => updateFilter("page", String(page - 1))}>Trước</Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => updateFilter("page", String(page + 1))}>Sau</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
