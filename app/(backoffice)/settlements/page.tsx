"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  ShieldCheck,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RoleGuard } from "@/components/providers/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "@/components/ui/popover";
import { useAppShell } from "@/components/providers/app-shell-provider";
import { maskMoneyByRole } from "@/lib/security";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { type SettlementLifecycle } from "@/lib/service-lifecycle";
import { cn } from "@/lib/utils";

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
    tourCode: "TN-HCM-24031", guide: "HDV Minh", advance: 50000000, actual: 47000000,
    variance: 3000000, status: "SUBMITTED", refundDirection: "TO_GUIDE", refundAmount: 3000000,
  },
];

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger"; icon: React.ElementType; color: string; bg: string; border: string }> = {
  SUBMITTED: { label: "Chờ duyệt", variant: "warning", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  APPROVED: { label: "Đã duyệt", variant: "info", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  REJECTED: { label: "Bị từ chối", variant: "danger", icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  PAID_OUT: { label: "Đã hoàn/thu", variant: "success", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
};

export default function SettlementsPage() {
  const { role } = useAppShell();
  const { filters, setManyFilters, updateFilter, resetFilters, hasActiveFilters } = useQueryFilters({
    status: "Tất cả", direction: "Tất cả", page: "1", sort: "amount_desc", search: "",
  });
  const [rows, setRows] = useState(initialRows);
  const [approvalThreshold] = useState(5000000);

  const approve = (tourCode: string) => setRows((prev) => prev.map((item) => (item.tourCode === tourCode ? { ...item, status: "APPROVED" } : item)));
  const completeRefund = (tourCode: string) => setRows((prev) => prev.map((item) => (item.tourCode === tourCode ? { ...item, status: "PAID_OUT" } : item)));
  const reject = (tourCode: string) => setRows((prev) => prev.map((item) => (item.tourCode === tourCode ? { ...item, status: "REJECTED", rejectReason: "Thiếu chứng từ thanh toán phát sinh" } : item)));

  const filteredRows = rows.filter((row) => {
    const byStatus = filters.status === "Tất cả" || row.status === filters.status;
    const byDirection = filters.direction === "Tất cả" || (filters.direction === "Hoàn cho HDV" && row.refundDirection === "TO_GUIDE") || (filters.direction === "Thu từ HDV" && row.refundDirection === "FROM_GUIDE");
    const bySearch = filters.search.trim() === "" || row.tourCode.toLowerCase().includes(filters.search.toLowerCase()) || row.guide.toLowerCase().includes(filters.search.toLowerCase());
    return byStatus && byDirection && bySearch;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({ status: params.get("status") ?? "Tất cả", direction: params.get("direction") ?? "Tất cả", page: params.get("page") ?? "1", sort: params.get("sort") ?? "amount_desc", search: params.get("search") ?? "" });
  }, [setManyFilters]);

  useEffect(() => {
    const params = new URLSearchParams(filters);
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

  const summary = useMemo(() => ({
    submitted: filteredRows.filter((r) => r.status === "SUBMITTED").length,
    approved: filteredRows.filter((r) => r.status === "APPROVED").length,
    rejected: filteredRows.filter((r) => r.status === "REJECTED").length,
    paidOut: filteredRows.filter((r) => r.status === "PAID_OUT").length,
    totalAmount: filteredRows.reduce((s, r) => s + r.refundAmount, 0),
  }), [filteredRows]);

  return (
    <RoleGuard allow={["OPS", "MANAGER"]}>
      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Quyết toán / Hoàn tiền HDV</h2>
              <p className="text-sm text-muted-foreground">Luồng tài chính cuối cùng trước khi chuyển tour sang trạng thái Thành công.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {(Object.entries(STATUS_META) as [string, typeof STATUS_META[string]][]).map(([key, meta]) => {
          const count = key === "SUBMITTED" ? summary.submitted : key === "APPROVED" ? summary.approved : key === "REJECTED" ? summary.rejected : summary.paidOut;
          const isActive = filters.status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => updateFilter("status", isActive ? "Tất cả" : key)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                isActive ? `${meta.border} ${meta.bg} ring-2 ring-current/10` : "border-border bg-card hover:shadow-sm",
              )}
            >
              <div className="flex items-center justify-between">
                <p className={cn("text-xs font-medium", isActive ? meta.color : "text-muted-foreground")}>{meta.label}</p>
                <meta.icon className={cn("size-4", isActive ? meta.color : "text-muted-foreground/60")} />
              </div>
              <p className={cn("mt-1 text-2xl font-bold tracking-tight tabular-nums", isActive ? meta.color : "text-foreground")}>{count}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{isActive ? "Nhấn để bỏ lọc" : "Nhấn để lọc"}</p>
            </button>
          );
        })}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-primary">Tổng giá trị xử lý</p>
            <Wallet className="size-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-primary">{maskMoneyByRole(summary.totalAmount, role)}</p>
        </div>
      </section>

      <UnifiedFilterBar title="List Quyết toán / Hoàn tiền" hasActiveFilters={hasActiveFilters} onReset={resetFilters}>
        <NativeSelect className="w-full" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
          <option>Tất cả</option><option>SUBMITTED</option><option>APPROVED</option><option>REJECTED</option><option>PAID_OUT</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.direction} onChange={(e) => updateFilter("direction", e.target.value)}>
          <option>Tất cả</option><option>Hoàn cho HDV</option><option>Thu từ HDV</option>
        </NativeSelect>
        <Input className="bg-card/80" placeholder="Tìm tour/HDV" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="amount_desc">Số tiền giảm dần</option><option value="amount_asc">Số tiền tăng dần</option>
          <option value="variance_desc">Chênh lệch giảm dần</option><option value="variance_asc">Chênh lệch tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      {/* Settlement cards */}
      <section className="space-y-4">
        {pagedRows.map((row) => {
          const meta = STATUS_META[row.status] ?? STATUS_META.SUBMITTED;
          const usagePercent = row.advance > 0 ? Math.round((row.actual / row.advance) * 100) : 0;
          return (
            <Card key={row.tourCode} className="p-0 transition-shadow hover:shadow-md">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 md:px-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-md font-mono text-xs">{row.tourCode}</Badge>
                    <span className="text-sm font-semibold">{row.guide}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={meta.variant} className="gap-1 rounded-md px-2 py-0.5 text-[11px]">
                      <meta.icon className="size-3" />{meta.label}
                    </Badge>
                    {row.refundAmount > approvalThreshold && (
                      <Badge variant="warning" className="gap-1 rounded-md px-2 py-0.5 text-[11px]">
                        <AlertTriangle className="size-3" />Vượt ngưỡng
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 py-4 md:px-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-3">
                      {/* Financial grid */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">Tạm ứng</p>
                          <p className="mt-0.5 text-sm font-semibold tabular-nums">{maskMoneyByRole(row.advance, role)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">Thực chi</p>
                          <p className="mt-0.5 text-sm font-semibold tabular-nums">{maskMoneyByRole(row.actual, role)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">Chênh lệch</p>
                          <p className="mt-0.5 text-sm font-semibold tabular-nums text-primary">{maskMoneyByRole(row.variance, role)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">Hướng</p>
                          <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
                            {row.refundDirection === "TO_GUIDE"
                              ? <><ArrowUpRight className="size-3.5 text-emerald-600" />Hoàn HDV</>
                              : <><ArrowDownLeft className="size-3.5 text-red-600" />Thu HDV</>}
                          </p>
                        </div>
                      </div>

                      {/* Usage bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Tỷ lệ sử dụng tạm ứng</span>
                          <span className="font-medium tabular-nums">{usagePercent}%</span>
                        </div>
                        <Progress value={usagePercent} className="mt-1 h-1.5" />
                      </div>

                      {row.rejectReason && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                          <XCircle className="mt-0.5 size-3.5 shrink-0" />
                          <span>{row.rejectReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Refund amount */}
                    <div className="flex flex-col items-end justify-center lg:min-w-[160px]">
                      <p className="text-2xl font-bold tabular-nums text-primary">{maskMoneyByRole(row.refundAmount, role)}</p>
                      <p className="text-[11px] text-muted-foreground">Số tiền hoàn/thu</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5 md:px-5">
                  <Link href={`/tours/${row.tourCode}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Eye className="size-3.5" />Xem tour</Button>
                  </Link>
                  <Button size="sm" className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700" onClick={() => approve(row.tourCode)}>
                    <Check className="size-3.5" />Duyệt
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1.5 text-xs" onClick={() => reject(row.tourCode)}>
                    <X className="size-3.5" />Từ chối
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs" onClick={() => completeRefund(row.tourCode)}>
                    <Wallet className="size-3.5" />Hoàn/Thu
                  </Button>
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
    </RoleGuard>
  );
}
