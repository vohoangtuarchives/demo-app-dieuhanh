"use client";

import { useEffect, useState } from "react";
import { GlassPanel, GlassStat, GlassTableContainer } from "@/components/glass/glass";
import { RoleGuard } from "@/components/providers/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppShell } from "@/components/providers/app-shell-provider";
import { maskMoneyByRole } from "@/lib/security";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { type SettlementLifecycle } from "@/lib/service-lifecycle";

type SettlementRow = {
  tourCode: string;
  guide: string;
  advance: number;
  actual: number;
  variance: number;
  status: SettlementLifecycle;
  refundDirection: "TO_GUIDE" | "FROM_GUIDE";
  refundAmount: number;
  rejectReason?: string;
};

const initialRows: SettlementRow[] = [
  {
    tourCode: "TN-HCM-24031",
    guide: "HDV Minh",
    advance: 50000000,
    actual: 47000000,
    variance: 3000000,
    status: "SUBMITTED",
    refundDirection: "TO_GUIDE",
    refundAmount: 3000000,
  },
];

export default function SettlementsPage() {
  const { role } = useAppShell();
  const { filters, setManyFilters, updateFilter, resetFilters, hasActiveFilters } = useQueryFilters({
    status: "Tất cả",
    direction: "Tất cả",
    page: "1",
    sort: "amount_desc",
    search: "",
  });
  const [rows, setRows] = useState(initialRows);
  const [approvalThreshold] = useState(5000000);

  const approve = (tourCode: string) => {
    setRows((prev) => prev.map((item) => (item.tourCode === tourCode ? { ...item, status: "APPROVED" } : item)));
  };

  const completeRefund = (tourCode: string) => {
    setRows((prev) => prev.map((item) => (item.tourCode === tourCode ? { ...item, status: "PAID_OUT" } : item)));
  };
  const reject = (tourCode: string) => {
    setRows((prev) =>
      prev.map((item) => (item.tourCode === tourCode ? { ...item, status: "REJECTED", rejectReason: "Thiếu chứng từ thanh toán phát sinh" } : item))
    );
  };
  const filteredRows = rows.filter((row) => {
    const byStatus = filters.status === "Tất cả" || row.status === filters.status;
    const byDirection =
      filters.direction === "Tất cả" ||
      (filters.direction === "Hoàn cho HDV" && row.refundDirection === "TO_GUIDE") ||
      (filters.direction === "Thu từ HDV" && row.refundDirection === "FROM_GUIDE");
    const bySearch =
      filters.search.trim() === "" ||
      row.tourCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      row.guide.toLowerCase().includes(filters.search.toLowerCase());
    return byStatus && byDirection && bySearch;
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      status: params.get("status") ?? "Tất cả",
      direction: params.get("direction") ?? "Tất cả",
      page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "amount_desc",
      search: params.get("search") ?? "",
    });
  }, [setManyFilters]);
  useEffect(() => {
    const params = new URLSearchParams({
      status: filters.status,
      direction: filters.direction,
      page: filters.page,
      sort: filters.sort,
      search: filters.search,
    });
    window.history.replaceState({}, "", `/settlements?${params.toString()}`);
  }, [filters]);
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (filters.sort === "amount_asc") return a.refundAmount - b.refundAmount;
    if (filters.sort === "amount_desc") return b.refundAmount - a.refundAmount;
    if (filters.sort === "variance_asc") return a.variance - b.variance;
    if (filters.sort === "variance_desc") return b.variance - a.variance;
    return 0;
  });
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pagedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <RoleGuard allow={["OPS", "MANAGER"]}>
      <GlassPanel>
        <h2 className="text-lg font-semibold">Quyết toán / Hoàn tiền HDV</h2>
        <p className="text-sm text-muted-foreground">Luồng tài chính cuối cùng trước khi chuyển tour sang trạng thái Thành công</p>
      </GlassPanel>

      <UnifiedFilterBar title="List Quyết toán / Hoàn tiền" hasActiveFilters={hasActiveFilters} onReset={resetFilters}>
        <select className="h-10 rounded-md border bg-card/80 px-3 text-sm" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả</option>
          <option>SUBMITTED</option>
          <option>APPROVED</option>
          <option>REJECTED</option>
          <option>PAID_OUT</option>
        </select>
        <select className="h-10 rounded-md border bg-card/80 px-3 text-sm" value={filters.direction} onChange={(e) => updateFilter("direction", e.target.value)}>
          <option>Tất cả</option>
          <option>Hoàn cho HDV</option>
          <option>Thu từ HDV</option>
        </select>
        <input className="h-10 rounded-md border bg-card/80 px-3 text-sm" placeholder="Tìm tour/HDV" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <select className="h-10 rounded-md border bg-card/80 px-3 text-sm" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="amount_desc">Số tiền giảm dần</option>
          <option value="amount_asc">Số tiền tăng dần</option>
          <option value="variance_desc">Chênh lệch giảm dần</option>
          <option value="variance_asc">Chênh lệch tăng dần</option>
        </select>
      </UnifiedFilterBar>

      <section className="grid gap-3 md:grid-cols-5">
        <GlassStat title="Chờ duyệt quyết toán" value={filteredRows.filter((row) => row.status === "SUBMITTED").length} />
        <GlassStat title="Đã duyệt" value={filteredRows.filter((row) => row.status === "APPROVED").length} />
        <GlassStat title="Bị từ chối" value={filteredRows.filter((row) => row.status === "REJECTED").length} />
        <GlassStat title="Đã hoàn/thu tiền" value={filteredRows.filter((row) => row.status === "PAID_OUT").length} />
        <GlassStat title="Giá trị xử lý" value={filteredRows.reduce((sum, row) => sum + row.refundAmount, 0).toLocaleString("vi-VN")} />
      </section>

      <GlassTableContainer>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="table-head-sticky">
              <TableHead>Tour</TableHead>
              <TableHead>HDV</TableHead>
              <TableHead>Tạm ứng</TableHead>
              <TableHead>Thực chi</TableHead>
              <TableHead>Chênh lệch</TableHead>
              <TableHead>Hướng hoàn/thu</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngưỡng duyệt</TableHead>
              <TableHead>Lý do từ chối</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((row) => (
              <TableRow key={row.tourCode}>
                <TableCell>{row.tourCode}</TableCell>
                <TableCell>{row.guide}</TableCell>
                <TableCell>{maskMoneyByRole(row.advance, role)}</TableCell>
                <TableCell>{maskMoneyByRole(row.actual, role)}</TableCell>
                <TableCell>{maskMoneyByRole(row.variance, role)}</TableCell>
                <TableCell>{row.refundDirection === "TO_GUIDE" ? "Hoàn cho HDV" : "Thu từ HDV"}</TableCell>
                <TableCell>{maskMoneyByRole(row.refundAmount, role)}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "PAID_OUT" ? "success" : row.status === "APPROVED" ? "info" : row.status === "REJECTED" ? "danger" : "warning"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.refundAmount > approvalThreshold ? <Badge variant="warning">Vượt ngưỡng duyệt</Badge> : <Badge variant="success">Trong ngưỡng</Badge>}</TableCell>
                <TableCell>{row.rejectReason ?? "-"}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => approve(row.tourCode)}>
                    Duyệt
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => reject(row.tourCode)}>
                    Từ chối
                  </Button>
                  <Button size="sm" onClick={() => completeRefund(row.tourCode)}>
                    Hoàn/Thu tiền
                  </Button>
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
    </RoleGuard>
  );
}
