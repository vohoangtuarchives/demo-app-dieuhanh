"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyBlock } from "@/components/backoffice/state-block";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { derivePaymentLifecycle, paymentLifecycleLabel, paymentLifecycleVariant, type PaymentLifecycle } from "@/lib/service-lifecycle";
import {
  AlertCircle,
  BanknoteIcon,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  History,
  MapPin,
  RefreshCw,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceRow = {
  code: string;
  tourCode: string;
  tourName: string;
  type: string;
  supplier: string;
  useDate: string;
  quantity: string;
  unitPrice: number;
  total: number;
  deposit: number;
  paid: number;
  dueDate: string;
};

const rows: ServiceRow[] = [
  {
    code: "PDV-1001", tourCode: "TN-HCM-24031", tourName: "Miền Tây 3N2Đ",
    type: "Xe", supplier: "An Bình Transport", useDate: "2026-03-24",
    quantity: "2 xe", unitPrice: 10000000, total: 20000000, deposit: 5000000, paid: 5000000, dueDate: "2026-03-25",
  },
  {
    code: "PDV-1002", tourCode: "QT-HN-24012", tourName: "Thái Lan 4N3Đ",
    type: "Vé", supplier: "SkyVN", useDate: "2026-03-28",
    quantity: "19 vé", unitPrice: 4200000, total: 79800000, deposit: 0, paid: 0, dueDate: "2026-03-20",
  },
];

const STAT_CONFIGS = [
  { key: "unpaid", label: "Chưa thanh toán", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  { key: "deposited", label: "Đã cọc", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  { key: "full", label: "Đã thanh toán đủ", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
] as const;

export default function ServicesPage() {
  const { filters, updateFilter, setManyFilters, resetFilters, hasActiveFilters } = useQueryFilters({
    serviceType: "Tất cả", paymentStatus: "Tất cả", supplier: "Tất cả", page: "1", sort: "dueDate_desc", search: "",
  });
  const [today] = useState("2026-03-24");
  const [selectedCode, setSelectedCode] = useState(rows[0].code);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [transactions, setTransactions] = useState<Record<string, { amount: number; date: string; note: string }[]>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      serviceType: params.get("serviceType") ?? "Tất cả", paymentStatus: params.get("paymentStatus") ?? "Tất cả",
      supplier: params.get("supplier") ?? "Tất cả", page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "dueDate_desc", search: params.get("search") ?? "",
    });
  }, [setManyFilters]);

  useEffect(() => {
    const params = new URLSearchParams(filters);
    window.history.replaceState({}, "", `/services?${params.toString()}`);
  }, [filters]);

  const data = useMemo(
    () => rows.map((r) => ({ ...r, status: derivePaymentLifecycle(r.paid, r.total), overdue: today > r.dueDate && r.paid < r.total })),
    [today],
  );
  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        const byService = filters.serviceType === "Tất cả" || row.type === filters.serviceType;
        const byPayment = filters.paymentStatus === "Tất cả" || paymentLifecycleLabel(row.status as PaymentLifecycle) === filters.paymentStatus || (filters.paymentStatus === "Đã cọc" && row.status === "DEPOSITED");
        const bySupplier = filters.supplier === "Tất cả" || row.supplier === filters.supplier;
        const bySearch = filters.search.trim() === "" || row.code.toLowerCase().includes(filters.search.toLowerCase()) || row.tourCode.toLowerCase().includes(filters.search.toLowerCase());
        return byService && byPayment && bySupplier && bySearch;
      }),
    [data, filters],
  );
  const sortedData = useMemo(() => {
    const copy = [...filteredData];
    if (filters.sort === "dueDate_asc") copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (filters.sort === "dueDate_desc") copy.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    if (filters.sort === "total_desc") copy.sort((a, b) => b.total - a.total);
    if (filters.sort === "total_asc") copy.sort((a, b) => a.total - b.total);
    return copy;
  }, [filteredData, filters.sort]);

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = sortedData.slice((page - 1) * pageSize, page * pageSize);
  const selectedRow = filteredData.find((item) => item.code === selectedCode) ?? filteredData[0];
  const summary = useMemo(
    () => ({
      unpaid: filteredData.filter((item) => item.status === "UNPAID").length,
      deposited: filteredData.filter((item) => item.status === "DEPOSITED" || item.status === "PARTIAL_PAID").length,
      full: filteredData.filter((item) => item.status === "PAID_FULL").length,
    }),
    [filteredData],
  );
  const totalValue = useMemo(() => filteredData.reduce((s, r) => s + r.total, 0), [filteredData]);
  const totalPaid = useMemo(() => filteredData.reduce((s, r) => s + r.paid, 0), [filteredData]);

  const applyPayment = (mode: "deposit" | "full") => {
    if (!selectedRow) return;
    const suggested = mode === "full" ? selectedRow.total - selectedRow.paid : Math.max(1000000, Math.round((selectedRow.total - selectedRow.paid) * 0.3));
    setPaymentAmount(String(suggested));
    setPaymentDate(today);
    setTransactions((prev) => ({
      ...prev,
      [selectedRow.code]: [...(prev[selectedRow.code] ?? []), { amount: suggested, date: today, note: mode === "full" ? "Thanh toán đủ" : "Giao dịch cọc" }],
    }));
  };

  return (
    <>
      {/* Page header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Quản lý Dịch vụ</h2>
              <p className="text-sm text-muted-foreground">Theo dõi thanh toán và tiến độ dịch vụ cho từng tour.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats - interactive */}
      <section className="grid gap-3 md:grid-cols-3">
        {STAT_CONFIGS.map((cfg) => {
          const count = summary[cfg.key];
          const isActive = filters.paymentStatus === cfg.label;
          return (
            <button
              key={cfg.key}
              type="button"
              onClick={() => updateFilter("paymentStatus", isActive ? "Tất cả" : cfg.label)}
              className={cn(
                "group rounded-xl border p-4 text-left transition-all",
                isActive
                  ? `${cfg.border} ${cfg.bg} ring-2 ring-current/10`
                  : "border-border bg-card hover:shadow-sm",
              )}
            >
              <div className="flex items-center justify-between">
                <p className={cn("text-xs font-medium", isActive ? cfg.color : "text-muted-foreground")}>{cfg.label}</p>
                <cfg.icon className={cn("size-4", isActive ? cfg.color : "text-muted-foreground/60")} />
              </div>
              <p className={cn("mt-1 text-2xl font-bold tracking-tight tabular-nums", isActive ? cfg.color : "text-foreground")}>{count}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isActive ? "Nhấn để bỏ lọc" : "Nhấn để lọc"}
              </p>
            </button>
          );
        })}
      </section>

      {/* Overall progress */}
      <Card className="p-0">
        <CardContent className="flex flex-wrap items-center gap-4 py-3 px-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tổng giá trị:</span>
            <span className="text-sm font-semibold tabular-nums">{totalValue.toLocaleString("vi-VN")}</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Progress value={totalValue > 0 ? (totalPaid / totalValue) * 100 : 0} className="h-2.5 flex-1" />
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0}% đã TT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Đã thanh toán:</span>
            <span className="text-sm font-semibold tabular-nums text-emerald-600">{totalPaid.toLocaleString("vi-VN")}</span>
          </div>
        </CardContent>
      </Card>

      <UnifiedFilterBar title="List Dịch vụ (Thanh toán DV)" hasActiveFilters={hasActiveFilters} onReset={resetFilters}>
        <NativeSelect className="w-full" value={filters.serviceType} onChange={(e) => updateFilter("serviceType", e.target.value)}>
          <option>Tất cả</option><option>Vé</option><option>Khách sạn</option><option>Xe</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.paymentStatus} onChange={(e) => updateFilter("paymentStatus", e.target.value)}>
          <option>Tất cả</option><option>Chưa thanh toán</option><option>Đã cọc</option><option>Đã thanh toán đủ</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.supplier} onChange={(e) => updateFilter("supplier", e.target.value)}>
          <option>Tất cả</option><option>An Bình Transport</option><option>SkyVN</option>
        </NativeSelect>
        <Input className="bg-card/80" placeholder="Tìm mã tour/mã phiếu" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="dueDate_desc">Hạn TT giảm dần</option><option value="dueDate_asc">Hạn TT tăng dần</option>
          <option value="total_desc">Giá trị giảm dần</option><option value="total_asc">Giá trị tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      {/* Service list */}
      <section className="space-y-4">
        {filteredData.length === 0 ? (
          <EmptyBlock message="Chưa có dịch vụ theo bộ lọc hiện tại." />
        ) : (
          pagedData.map((row) => {
            const paidPercent = row.total > 0 ? Math.round((row.paid / row.total) * 100) : 0;
            const remaining = row.total - row.paid;
            const isSelected = selectedCode === row.code;
            return (
              <Card key={row.code} className={cn("p-0 transition-all", isSelected && "ring-2 ring-primary/30")}>
                <CardContent className="p-0">
                  {/* Top bar: code + tour + badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-md font-mono text-xs">{row.code}</Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" aria-hidden />{row.tourCode}
                      </span>
                      <span className="text-sm font-semibold">{row.tourName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={paymentLifecycleVariant(row.status as PaymentLifecycle)} className="rounded-md px-2 py-0.5 text-[11px]">
                        {paymentLifecycleLabel(row.status as PaymentLifecycle)}
                      </Badge>
                      {row.overdue && (
                        <Badge variant="danger" className="animate-pulse rounded-md px-2 py-0.5 text-[11px]">
                          Quá hạn
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-4 md:px-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      {/* Left: details grid */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <BriefcaseBusiness className="size-3.5 text-muted-foreground" aria-hidden />
                            <span className="text-muted-foreground">Loại:</span>
                            <span className="font-medium">{row.type}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <Users className="size-3.5 text-muted-foreground" aria-hidden />
                            <span className="text-muted-foreground">NCC:</span>
                            <span className="font-medium">{row.supplier}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
                            <span className="text-muted-foreground">Sử dụng:</span>
                            <span className="font-medium">{row.useDate}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg bg-muted/40 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">SL/Đơn vị</p>
                            <p className="text-sm font-semibold">{row.quantity}</p>
                          </div>
                          <div className="rounded-lg bg-muted/40 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">Đơn giá</p>
                            <p className="text-sm font-semibold tabular-nums">{row.unitPrice.toLocaleString("vi-VN")}</p>
                          </div>
                          <div className="rounded-lg bg-muted/40 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">Hạn TT</p>
                            <p className={cn("text-sm font-semibold", row.overdue && "text-red-600")}>{row.dueDate}</p>
                          </div>
                          <div className="rounded-lg bg-muted/40 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">Còn lại</p>
                            <p className={cn("text-sm font-semibold tabular-nums", remaining > 0 ? "text-amber-600" : "text-emerald-600")}>
                              {remaining.toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: total + progress */}
                      <div className="flex flex-col items-end justify-between gap-2 lg:min-w-[180px]">
                        <div className="text-right">
                          <p className="text-2xl font-bold tabular-nums">{row.total.toLocaleString("vi-VN")}</p>
                          <p className="text-[11px] text-muted-foreground">Tổng giá trị</p>
                        </div>
                        <div className="w-full space-y-1">
                          <Progress value={paidPercent} className="h-2" />
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Đã TT: <span className="font-medium tabular-nums text-foreground">{row.paid.toLocaleString("vi-VN")}</span></span>
                            <span className="font-medium tabular-nums text-primary">{paidPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 md:px-5">
                    <Link href={`/tours/${row.tourCode}`}>
                      <Button variant="outline" size="sm" className="gap-1.5"><Eye className="size-3.5" aria-hidden />Xem tour</Button>
                    </Link>
                    <Button
                      size="sm"
                      className={cn("gap-1.5", isSelected ? "bg-primary" : "bg-emerald-600 hover:bg-emerald-700")}
                      onClick={() => setSelectedCode(row.code)}
                    >
                      <RefreshCw className="size-3.5" aria-hidden />Cập nhật TT
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setSelectedCode(row.code)}>
                      <Upload className="size-3.5" aria-hidden />Đính chứng từ
                    </Button>
                    {isSelected && (
                      <span className="ml-auto text-[11px] font-medium text-primary">Đang chọn</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {totalPages > 1 && (
          <Card className="p-0">
            <CardContent className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Trang {page}/{totalPages} — {sortedData.length} bản ghi</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => updateFilter("page", String(page - 1))}>Trước</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => updateFilter("page", String(page + 1))}>Sau</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Payment detail panel */}
      {selectedRow && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold">Cập nhật thanh toán — {selectedRow.code}</h3>
                  <p className="text-xs text-muted-foreground">
                    Tour {selectedRow.tourCode} · NCC {selectedRow.supplier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums text-primary">
                  {(selectedRow.total - selectedRow.paid).toLocaleString("vi-VN")}
                </p>
                <p className="text-[11px] text-muted-foreground">Còn phải thanh toán</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment progress for selected */}
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tiến độ thanh toán</span>
                <span className="font-semibold tabular-nums text-primary">
                  {selectedRow.total > 0 ? Math.round((selectedRow.paid / selectedRow.total) * 100) : 0}%
                </span>
              </div>
              <Progress value={selectedRow.total > 0 ? (selectedRow.paid / selectedRow.total) * 100 : 0} className="mt-2 h-3" />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Đã TT: <span className="font-medium text-emerald-600 tabular-nums">{selectedRow.paid.toLocaleString("vi-VN")}</span></span>
                <span>Tổng: <span className="font-medium text-foreground tabular-nums">{selectedRow.total.toLocaleString("vi-VN")}</span></span>
              </div>
            </div>

            {/* Payment form */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  <BanknoteIcon className="mr-1 inline size-3.5" />
                  Số tiền giao dịch
                </label>
                <Input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0" className="tabular-nums" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  <CalendarDays className="mr-1 inline size-3.5" />
                  Ngày thanh toán
                </label>
                <Input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="YYYY-MM-DD" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => applyPayment("deposit")}>
                <Clock className="size-3.5" />
                Đánh dấu đã cọc
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => applyPayment("full")}>
                <CheckCircle2 className="size-3.5" />
                Đánh dấu thanh toán đủ
              </Button>
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Upload className="size-3.5" />
                Upload chứng từ
              </Button>
            </div>

            {/* Transaction log */}
            <div className="rounded-lg border border-border">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <History className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold">Transaction log</p>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {(transactions[selectedRow.code] ?? []).length} giao dịch
                </Badge>
              </div>
              <div className="p-3">
                {(transactions[selectedRow.code] ?? []).length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">Chưa có giao dịch nào.</p>
                ) : (
                  <div className="space-y-2">
                    {(transactions[selectedRow.code] ?? []).map((tx, idx) => (
                      <div key={`${selectedRow.code}-${idx}`} className="flex items-start gap-2">
                        <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CreditCard className="size-2.5 text-primary" />
                        </div>
                        <div className="text-xs">
                          <p className="font-medium">{tx.note}</p>
                          <p className="text-muted-foreground">{tx.date} — <span className="font-semibold tabular-nums text-foreground">{tx.amount.toLocaleString("vi-VN")}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
