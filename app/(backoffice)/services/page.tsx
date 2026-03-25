"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassTableContainer, GlassStat } from "@/components/glass/glass";
import { EmptyBlock } from "@/components/backoffice/state-block";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { derivePaymentLifecycle, paymentLifecycleLabel, paymentLifecycleVariant, type PaymentLifecycle } from "@/lib/service-lifecycle";

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
        <Input className="bg-card/80 backdrop-blur-sm" placeholder="Tìm mã tour/mã phiếu" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        <NativeSelect className="w-full" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="dueDate_desc">Hạn TT giảm dần</option>
          <option value="dueDate_asc">Hạn TT tăng dần</option>
          <option value="total_desc">Giá trị giảm dần</option>
          <option value="total_asc">Giá trị tăng dần</option>
        </NativeSelect>
      </UnifiedFilterBar>

      <section className="grid gap-3 md:grid-cols-3">
        <GlassStat title="Chưa thanh toán" value={summary.unpaid} />
        <GlassStat title="Đã cọc" value={summary.deposited} />
        <GlassStat title="Đã thanh toán đủ" value={summary.full} />
      </section>

      <GlassTableContainer>
        {filteredData.length === 0 ? (
          <EmptyBlock message="Chưa có dịch vụ theo bộ lọc hiện tại." />
        ) : (
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="table-head-sticky">
              <TableHead>Mã phiếu DV</TableHead>
              <TableHead>Mã tour</TableHead>
              <TableHead>Tên tour</TableHead>
              <TableHead>Loại DV</TableHead>
              <TableHead>NCC</TableHead>
              <TableHead>Ngày sử dụng</TableHead>
              <TableHead>SL/Đơn vị</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Tiền cọc</TableHead>
              <TableHead>Còn lại</TableHead>
              <TableHead>Đã thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hạn TT</TableHead>
              <TableHead>Quá hạn</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((row) => (
              <TableRow key={row.code}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.tourCode}</TableCell>
                <TableCell>{row.tourName}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.supplier}</TableCell>
                <TableCell>{row.useDate}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.unitPrice.toLocaleString("vi-VN")}</TableCell>
                <TableCell>{row.total.toLocaleString("vi-VN")}</TableCell>
                <TableCell>{row.deposit.toLocaleString("vi-VN")}</TableCell>
                <TableCell>{(row.total - row.paid).toLocaleString("vi-VN")}</TableCell>
                <TableCell>{row.paid.toLocaleString("vi-VN")}</TableCell>
                <TableCell>
                  <Badge variant={paymentLifecycleVariant(row.status as PaymentLifecycle)}>{paymentLifecycleLabel(row.status as PaymentLifecycle)}</Badge>
                </TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>{row.overdue ? <Badge variant="danger">Quá hạn</Badge> : <Badge variant="secondary">Không</Badge>}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="default" size="sm" onClick={() => setSelectedCode(row.code)}>Cập nhật TT</Button>
                  <Button variant="secondary" size="sm">Đính chứng từ</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
        <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
          <span>Trang {page}/{totalPages} - {sortedData.length} bản ghi</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => updateFilter("page", String(page - 1))}>Trước</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => updateFilter("page", String(page + 1))}>Sau</Button>
          </div>
        </div>
      </GlassTableContainer>

      {selectedRow ? (
        <GlassTableContainer>
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
        </GlassTableContainer>
      ) : null}
    </>
  );
}
