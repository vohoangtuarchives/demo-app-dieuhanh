"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlStat, PlTableShell } from "@/components/preline/layout-primitives";
import { EmptyBlock } from "@/components/backoffice/state-block";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { derivePaymentLifecycle, paymentLifecycleLabel, paymentLifecycleVariant, type PaymentLifecycle } from "@/lib/service-lifecycle";
import { BriefcaseBusiness, CalendarDays, Eye, MapPin, RefreshCw, Upload, Users } from "lucide-react";

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
    code: "PDV-1001",
    tourCode: "TN-HCM-24031",
    tourName: "Miền Tây 3N2Đ",
    type: "Xe",
    supplier: "An Bình Transport",
    useDate: "2026-03-24",
    quantity: "2 xe",
    unitPrice: 10000000,
    total: 20000000,
    deposit: 5000000,
    paid: 5000000,
    dueDate: "2026-03-25",
  },
  {
    code: "PDV-1002",
    tourCode: "QT-HN-24012",
    tourName: "Thái Lan 4N3Đ",
    type: "Vé",
    supplier: "SkyVN",
    useDate: "2026-03-28",
    quantity: "19 vé",
    unitPrice: 4200000,
    total: 79800000,
    deposit: 0,
    paid: 0,
    dueDate: "2026-03-20",
  },
];

export default function ServicesPage() {
  const { filters, updateFilter, setManyFilters, resetFilters, hasActiveFilters } = useQueryFilters({
    serviceType: "Tất cả",
    paymentStatus: "Tất cả",
    supplier: "Tất cả",
    page: "1",
    sort: "dueDate_desc",
    search: "",
  });
  const [today] = useState("2026-03-24");
  const [selectedCode, setSelectedCode] = useState(rows[0].code);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [transactions, setTransactions] = useState<Record<string, { amount: number; date: string; note: string }[]>>({});
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      serviceType: params.get("serviceType") ?? "Tất cả",
      paymentStatus: params.get("paymentStatus") ?? "Tất cả",
      supplier: params.get("supplier") ?? "Tất cả",
      page: params.get("page") ?? "1",
      sort: params.get("sort") ?? "dueDate_desc",
      search: params.get("search") ?? "",
    });
  }, [setManyFilters]);
  useEffect(() => {
    const params = new URLSearchParams({
      serviceType: filters.serviceType,
      paymentStatus: filters.paymentStatus,
      supplier: filters.supplier,
      page: filters.page,
      sort: filters.sort,
      search: filters.search,
    });
    window.history.replaceState({}, "", `/services?${params.toString()}`);
  }, [filters]);
  const data = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        status: derivePaymentLifecycle(r.paid, r.total),
        overdue: today > r.dueDate && r.paid < r.total,
      })),
    [today]
  );
  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        const byService = filters.serviceType === "Tất cả" || row.type === filters.serviceType;
        const byPayment =
          filters.paymentStatus === "Tất cả" ||
          paymentLifecycleLabel(row.status as PaymentLifecycle) === filters.paymentStatus ||
          (filters.paymentStatus === "Đã cọc" && row.status === "DEPOSITED");
        const bySupplier = filters.supplier === "Tất cả" || row.supplier === filters.supplier;
        const bySearch =
          filters.search.trim() === "" ||
          row.code.toLowerCase().includes(filters.search.toLowerCase()) ||
          row.tourCode.toLowerCase().includes(filters.search.toLowerCase());
        return byService && byPayment && bySupplier && bySearch;
      }),
    [data, filters]
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
    [filteredData]
  );

  const applyPayment = (mode: "deposit" | "full") => {
    if (!selectedRow) return;
    const suggested = mode === "full" ? selectedRow.total - selectedRow.paid : Math.max(1000000, Math.round((selectedRow.total - selectedRow.paid) * 0.3));
    setPaymentAmount(String(suggested));
    setPaymentDate(today);
    setTransactions((prev) => ({
      ...prev,
      [selectedRow.code]: [
        ...(prev[selectedRow.code] ?? []),
        {
          amount: suggested,
          date: today,
          note: mode === "full" ? "Thanh toán đủ" : "Giao dịch cọc",
        },
      ],
    }));
  };

  return (
    <>
      <section className="grid gap-3 md:grid-cols-3">
        <PlStat title="Chưa thanh toán" value={summary.unpaid} />
        <PlStat title="Đã cọc" value={summary.deposited} />
        <PlStat title="Đã thanh toán đủ" value={summary.full} />
      </section>

      <UnifiedFilterBar title="List Dịch vụ (Thanh toán DV)" hasActiveFilters={hasActiveFilters} onReset={resetFilters}>
        <NativeSelect className="w-full" value={filters.serviceType} onChange={(e) => updateFilter("serviceType", e.target.value)}>
          <option>Tất cả</option>
          <option>Vé</option>
          <option>Khách sạn</option>
          <option>Xe</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.paymentStatus} onChange={(e) => updateFilter("paymentStatus", e.target.value)}>
          <option>Tất cả</option>
          <option>Chưa thanh toán</option>
          <option>Đã cọc</option>
          <option>Đã thanh toán đủ</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.supplier} onChange={(e) => updateFilter("supplier", e.target.value)}>
          <option>Tất cả</option>
          <option>An Bình Transport</option>
          <option>SkyVN</option>
        </NativeSelect>
        <Input
          className="bg-card/80 backdrop-blur-sm"
          placeholder="Tìm mã tour/mã phiếu"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="dueDate_desc">Hạn TT giảm dần</option>
          <option value="dueDate_asc">Hạn TT tăng dần</option>
          <option value="total_desc">Giá trị giảm dần</option>
          <option value="total_asc">Giá trị tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      <section className="space-y-4">
        {filteredData.length === 0 ? (
          <EmptyBlock message="Chưa có dịch vụ theo bộ lọc hiện tại." />
        ) : (
          <div className="space-y-4">
            {pagedData.map((row) => (
              <div
                key={row.code}
                className="rounded-xl border border-border bg-background/90 shadow-sm"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-md px-2.5 py-1">
                          {row.code}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" aria-hidden />
                          {row.tourCode}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {row.tourName}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <BriefcaseBusiness className="size-3.5" aria-hidden />
                          <span className="font-medium text-foreground">{row.type}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3.5" aria-hidden />
                          <span className="font-medium text-foreground">{row.supplier}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge
                        variant={paymentLifecycleVariant(row.status as PaymentLifecycle)}
                        className="rounded-md px-2.5 py-1"
                      >
                        {paymentLifecycleLabel(row.status as PaymentLifecycle)}
                      </Badge>
                      {row.overdue ? (
                        <Badge variant="danger" className="rounded-md px-2.5 py-1">
                          Quá hạn
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-md px-2.5 py-1 text-muted-foreground">
                          Không
                        </Badge>
                      )}
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {row.total.toLocaleString("vi-VN")}
                        </p>
                        <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" aria-hidden />
                        Ngày sử dụng
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {row.useDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SL/Đơn vị</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {row.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Đơn giá</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {row.unitPrice.toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hạn TT</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {row.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Link
                      href={`/tours/${row.tourCode}`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Eye className="size-4" aria-hidden />
                      Xem tour
                    </Link>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-9 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => setSelectedCode(row.code)}
                    >
                      <RefreshCw className="size-4" aria-hidden />
                      Cập nhật TT
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 gap-2"
                      onClick={() => {
                        // Demo: nút này mở form chi tiết thông qua Cập nhật TT (keeps behavior consistent).
                        setSelectedCode(row.code);
                      }}
                    >
                      <Upload className="size-4" aria-hidden />
                      Đính chứng từ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
            <span>Trang {page}/{totalPages} - {sortedData.length} bản ghi</span>
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
      </section>

      {selectedRow ? (
        <PlTableShell>
          <div className="p-3">
            <h3 className="font-semibold">Chi tiết cập nhật thanh toán - {selectedRow.code}</h3>
            <p className="text-xs text-muted-foreground">
              Tour {selectedRow.tourCode} | NCC {selectedRow.supplier} | Còn lại {(selectedRow.total - selectedRow.paid).toLocaleString("vi-VN")}
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <Input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Số tiền giao dịch" />
              <Input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="Ngày thanh toán (YYYY-MM-DD)" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => applyPayment("deposit")}>Đánh dấu đã cọc</Button>
              <Button size="sm" variant="default" onClick={() => applyPayment("full")}>Đánh dấu thanh toán đủ</Button>
              <Button size="sm" variant="secondary">Upload chứng từ</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Rule: paid=0 chưa TT; 0&lt;paid&lt;total đã cọc; paid&gt;=total đã thanh toán đủ.</p>
            <div className="mt-3 rounded-md border p-2">
              <p className="text-xs font-medium">Transaction log</p>
              <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                {(transactions[selectedRow.code] ?? []).map((tx, idx) => (
                  <p key={`${selectedRow.code}-${idx}`}>{tx.date} - {tx.note}: {tx.amount.toLocaleString("vi-VN")}</p>
                ))}
                {(transactions[selectedRow.code] ?? []).length === 0 ? <p>Chưa có giao dịch.</p> : null}
              </div>
            </div>
          </div>
        </PlTableShell>
      ) : null}
    </>
  );
}
