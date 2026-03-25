"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlPanel } from "@/components/preline/layout-primitives";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { type BookingLifecycle } from "@/lib/service-lifecycle";
import { BriefcaseBusiness, CalendarDays, Eye, MapPin, RefreshCw, Send, Trash2, Upload, UserRound, X } from "lucide-react";

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
  {
    code: "BK-1203",
    createdDate: "21/03/2026",
    tourCode: "TN-HCM-24031",
    tourName: "Miền Tây 3N2Đ",
    serviceType: "Nhà hàng",
    supplier: "Ẩm Thực Sông Nước",
    useDate: "25/03/2026",
    totalValue: 26000000,
    status: "CONFIRMED",
    hasConfirmFile: true,
  },
  {
    code: "BK-1204",
    createdDate: "22/03/2026",
    tourCode: "QT-HN-24012",
    tourName: "Thái Lan 4N3Đ",
    serviceType: "Khách sạn",
    supplier: "Bangkok Stay",
    useDate: "28/03/2026",
    totalValue: 143000000,
    status: "SENT",
    hasConfirmFile: false,
  },
];

export default function BookingsPage() {
  const { filters, updateFilter, setManyFilters, resetFilters, hasActiveFilters } = useQueryFilters({
    serviceType: "Tất cả",
    status: "Tất cả",
    supplier: "Tất cả",
    page: "1",
    sort: "createdDate_desc",
    search: "",
  });
  const [rows, setRows] = useState(initialRows);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      serviceType: params.get("serviceType") ?? "Tất cả",
      status: params.get("status") ?? "Tất cả",
      supplier: params.get("supplier") ?? "Tất cả",
      page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "createdDate_desc",
      search: params.get("search") ?? "",
    });
  }, [setManyFilters]);
  useEffect(() => {
    const params = new URLSearchParams({
      serviceType: filters.serviceType,
      status: filters.status,
      supplier: filters.supplier,
      page: filters.page,
      sort: filters.sort,
      search: filters.search,
    });
    window.history.replaceState({}, "", `/bookings?${params.toString()}`);
  }, [filters]);

  const tryConfirm = (code: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.code !== code) return row;
        if (!row.hasConfirmFile) return { ...row, status: "PARTIAL_CONFIRMED" };
        return { ...row, status: "CONFIRMED" };
      })
    );
  };
  const markSent = (code: string) => {
    setRows((prev) => prev.map((row) => (row.code === code ? { ...row, status: "SENT" } : row)));
  };
  const cancelBooking = (code: string) => {
    setRows((prev) => prev.map((row) => (row.code === code ? { ...row, status: "CANCELLED" } : row)));
  };
  const uploadFile = (code: string) => {
    setRows((prev) => prev.map((row) => (row.code === code ? { ...row, hasConfirmFile: true } : row)));
  };
  const softDelete = (code: string) => {
    setRows((prev) => prev.map((row) => (row.code === code ? { ...row, deletedAt: new Date().toLocaleString("vi-VN") } : row)));
  };

  const filteredRows = rows.filter((row) => {
    if (row.deletedAt) return false;
    const byStatus = filters.status === "Tất cả" || row.status === filters.status;
    const bySupplier = filters.supplier === "Tất cả" || row.supplier === filters.supplier;
    const bySearch =
      filters.search.trim() === "" ||
      row.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      row.tourCode.toLowerCase().includes(filters.search.toLowerCase());
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

  const summary = {
    pending: filteredRows.filter((row) => row.status !== "CONFIRMED").length,
    confirmed: filteredRows.filter((row) => row.status === "CONFIRMED").length,
  };

  const statusVariant = (status: BookingLifecycle) => {
    if (status === "CONFIRMED") return "success" as const;
    if (status === "PARTIAL_CONFIRMED") return "warning" as const;
    if (status === "SENT") return "info" as const;
    if (status === "CANCELLED") return "danger" as const;
    return "secondary" as const;
  };

  const fileBadge = (hasConfirmFile: boolean) =>
    hasConfirmFile ? (
      <Badge variant="success" className="rounded-md px-2.5 py-1">
        Đã upload
      </Badge>
    ) : (
      <Badge variant="outline" className="rounded-md border-border/80 bg-muted/30 px-2.5 py-1 text-muted-foreground">
        Thiếu file
      </Badge>
    );

  return (
    <>
      <PlPanel>
        <h2 className="text-lg font-semibold">Quản lý Booking — Không hình ảnh</h2>
        <p className="mt-1 text-sm text-muted-foreground">Danh sách phiếu đặt dịch vụ tour đang được điều hành (demo).</p>
      </PlPanel>

      <UnifiedFilterBar
        title="List Phiếu đặt DV"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        rightActions={
          <Link href="/bookings/new" className="text-sm font-medium text-primary hover:underline">
            Tạo phiếu DV
          </Link>
        }
      >
        <NativeSelect className="w-full" value={filters.serviceType} onChange={(e) => updateFilter("serviceType", e.target.value)}>
          <option>Tất cả</option>
          <option>Nhà hàng</option>
          <option>Khách sạn</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả</option>
          <option>SENT</option>
          <option>PARTIAL_CONFIRMED</option>
          <option>CONFIRMED</option>
          <option>CANCELLED</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.supplier} onChange={(e) => updateFilter("supplier", e.target.value)}>
          <option>Tất cả</option>
          <option>Bangkok Stay</option>
          <option>Ẩm Thực Sông Nước</option>
        </NativeSelect>
        <Input
          className="bg-card/80 backdrop-blur-sm"
          placeholder="Tìm mã phiếu/mã tour"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="createdDate_desc">Ngày tạo giảm dần</option>
          <option value="createdDate_asc">Ngày tạo tăng dần</option>
          <option value="total_desc">Giá trị giảm dần</option>
          <option value="total_asc">Giá trị tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      <section className="space-y-4">
        {pagedRows.map((row) => (
          <div key={row.code} className="rounded-xl border border-border bg-background/90 shadow-sm">
            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold">{row.tourName}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-muted/30 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60">
                      {row.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />
                      {row.tourCode}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {row.totalValue.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(row.status)} className="rounded-md px-2.5 py-1">
                  {row.status}
                </Badge>
                {fileBadge(row.hasConfirmFile)}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BriefcaseBusiness className="size-3.5" aria-hidden />
                    Loại DV
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{row.serviceType}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="size-3.5" aria-hidden />
                    NCC
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{row.supplier}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden />
                    Ngày tạo
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{row.createdDate}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden />
                    Ngày sử dụng
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{row.useDate}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-3 md:justify-end">
                <Link
                  href={`/tours/${row.tourCode}`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Eye className="size-4" aria-hidden />
                  Xem tour
                </Link>

                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => markSent(row.code)}
                >
                  <Send className="size-4" aria-hidden />
                  Gửi NCC
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => uploadFile(row.code)}
                >
                  <Upload className="size-4" aria-hidden />
                  Upload file
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => tryConfirm(row.code)}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  Cập nhật trạng thái
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => cancelBooking(row.code)}
                >
                  <X className="size-4" aria-hidden />
                  Hủy
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => softDelete(row.code)}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Xóa mềm
                </Button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
          <span>
            Trang {page}/{totalPages} - {sortedRows.length} bản ghi
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => updateFilter("page", String(page - 1))}
            >
              Trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => updateFilter("page", String(page + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
