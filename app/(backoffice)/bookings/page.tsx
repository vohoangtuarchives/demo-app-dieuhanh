"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassTableContainer, GlassStat } from "@/components/glass/glass";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { type BookingLifecycle } from "@/lib/service-lifecycle";

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

  return (
    <>
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
        <Input className="bg-card/80 backdrop-blur-sm" placeholder="Tìm mã phiếu/mã tour" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="createdDate_desc">Ngày tạo giảm dần</option>
          <option value="createdDate_asc">Ngày tạo tăng dần</option>
          <option value="total_desc">Giá trị giảm dần</option>
          <option value="total_asc">Giá trị tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      <section className="grid gap-3 md:grid-cols-2">
        <GlassStat title="Phiếu chưa xác nhận" value={summary.pending} />
        <GlassStat title="Phiếu đã xác nhận" value={summary.confirmed} />
      </section>

      <GlassTableContainer>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="table-head-sticky">
              <TableHead>Mã phiếu</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Mã tour</TableHead>
              <TableHead>Tên tour</TableHead>
              <TableHead>Loại DV</TableHead>
              <TableHead>NCC</TableHead>
              <TableHead>Ngày sử dụng</TableHead>
              <TableHead>Tổng GT</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>File xác nhận</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((row) => (
              <TableRow key={row.code}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>{row.tourCode}</TableCell>
                <TableCell>{row.tourName}</TableCell>
                <TableCell>{row.serviceType}</TableCell>
                <TableCell>{row.supplier}</TableCell>
                <TableCell>{row.useDate}</TableCell>
                <TableCell>{row.totalValue.toLocaleString("vi-VN")}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "CONFIRMED" ? "success" : row.status === "PARTIAL_CONFIRMED" ? "warning" : row.status === "CANCELLED" ? "danger" : "info"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.hasConfirmFile ? <Badge variant="success">Đã upload</Badge> : <Badge variant="danger">Thiếu file</Badge>}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => markSent(row.code)}>Gửi NCC</Button>
                  <Button variant="secondary" size="sm" onClick={() => uploadFile(row.code)}>Upload file</Button>
                  <Button size="sm" onClick={() => tryConfirm(row.code)}>
                    Cập nhật trạng thái
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => cancelBooking(row.code)}>Hủy</Button>
                  <Button size="sm" variant="outline" onClick={() => softDelete(row.code)}>Xóa mềm</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
          <span>Trang {page}/{totalPages} - {sortedRows.length} bản ghi</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => updateFilter("page", String(page - 1))}>Trước</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => updateFilter("page", String(page + 1))}>Sau</Button>
          </div>
        </div>
      </GlassTableContainer>
    </>
  );
}
