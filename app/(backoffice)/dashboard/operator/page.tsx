"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck,
  Layers,
  Map,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { operatorCards, TOUR_STATUSES } from "@/lib/app-data";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOperatorDashboard } from "@/lib/api/dashboard-service";
import type { OperatorDashboardPayload } from "@/lib/api/contracts";
import { ErrorBlock, LoadingBlock } from "@/components/backoffice/state-block";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { cn } from "@/lib/utils";

const paymentCards = [
  { title: "Chưa thanh toán", value: 26, hint: "9 quá hạn", tone: "warning" as const },
  { title: "Đã cọc", value: 34, hint: "Đang theo dõi", tone: "default" as const },
  { title: "Đã thanh toán đủ", value: 78, hint: "Hoàn tất", tone: "success" as const },
];

const bookingCards = [
  { title: "Phiếu chưa xác nhận", value: 19 },
  { title: "Phiếu đã xác nhận", value: 81 },
];

const chartData = [
  { label: "Tour khách lẻ", value: 82, total: 120 },
  { label: "Tour khách đoàn", value: 57, total: 120 },
  { label: "LN khách lẻ (tỷ)", value: 4.2, total: 6 },
  { label: "LN khách đoàn (tỷ)", value: 5.1, total: 6 },
];

const statusRows: Record<string, { code: string; tourName: string; operator: string; branch: string; startDate: string }[]> = {
  "Chờ nhận": [
    { code: "TN-HCM-24055", tourName: "Nha Trang 4N3Đ", operator: "Chưa phân công", branch: "HCM", startDate: "02/04/2026" },
    { code: "QT-HN-24019", tourName: "Singapore 3N2Đ", operator: "Chưa phân công", branch: "Hà Nội", startDate: "06/04/2026" },
  ],
  "Đã nhận": [{ code: "TN-CT-24021", tourName: "Phú Quốc 3N2Đ", operator: "Lê Quốc C", branch: "Cần Thơ", startDate: "29/03/2026" }],
  "Đang dự toán": [{ code: "QT-HN-24012", tourName: "Thái Lan 4N3Đ", operator: "Trần Thị B", branch: "Hà Nội", startDate: "28/03/2026" }],
  "Bàn giao HDV": [{ code: "IB-CT-24008", tourName: "Mekong Discovery", operator: "Lê Quốc C", branch: "Cần Thơ", startDate: "02/04/2026" }],
  "HDV nhận": [{ code: "TN-HCM-24011", tourName: "Đà Lạt 3N2Đ", operator: "Nguyễn Văn A", branch: "HCM", startDate: "30/03/2026" }],
  "Đang diễn ra": [{ code: "TN-HCM-24031", tourName: "Miền Tây 3N2Đ", operator: "Nguyễn Văn A", branch: "HCM", startDate: "24/03/2026" }],
  "Kết thúc": [{ code: "TN-HCM-24028", tourName: "Hà Giang 5N4Đ", operator: "Phạm T D", branch: "HCM", startDate: "19/03/2026" }],
  "Đã quyết toán": [{ code: "QT-HCM-24007", tourName: "Bali 4N3Đ", operator: "Nguyễn Văn A", branch: "HCM", startDate: "14/03/2026" }],
  "Chưa hoàn tiền": [{ code: "IB-QB-24002", tourName: "Central Vietnam", operator: "Lâm H", branch: "Quảng Bình", startDate: "12/03/2026" }],
  "Thành công": [{ code: "TN-CM-24001", tourName: "Cà Mau 2N1Đ", operator: "Võ P", branch: "Cà Mau", startDate: "07/03/2026" }],
};

const servicePaymentRows = {
  "Chưa thanh toán": [
    { voucherCode: "PDV-1002", tourCode: "QT-HN-24012", serviceType: "Vé máy bay", dueDate: "20/03/2026", overdue: "Quá hạn" },
    { voucherCode: "PDV-1008", tourCode: "TN-HCM-24055", serviceType: "Khách sạn", dueDate: "29/03/2026", overdue: "Sắp đến hạn" },
  ],
  "Đã cọc": [{ voucherCode: "PDV-1001", tourCode: "TN-HCM-24031", serviceType: "Xe du lịch", dueDate: "25/03/2026", overdue: "Không" }],
  "Đã thanh toán đủ": [{ voucherCode: "PDV-0998", tourCode: "IB-CT-24008", serviceType: "Nhà hàng", dueDate: "19/03/2026", overdue: "Không" }],
};

const bookingRowsByStatus = {
  "Phiếu chưa xác nhận": [
    { bookingCode: "BK-1204", tourCode: "QT-HN-24012", supplier: "Bangkok Stay", useDate: "28/03/2026" },
    { bookingCode: "BK-1211", tourCode: "TN-HCM-24055", supplier: "Nha Trang Hotel", useDate: "02/04/2026" },
  ],
  "Phiếu đã xác nhận": [{ bookingCode: "BK-1203", tourCode: "TN-HCM-24031", supplier: "Ẩm Thực Sông Nước", useDate: "25/03/2026" }],
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

const TONE_CLASS: Record<string, string> = {
  warning: "text-amber-600",
  success: "text-emerald-600",
  default: "text-foreground",
};

export default function OperatorDashboardPage() {
  const { filters, updateFilter, setManyFilters } = useQueryFilters({
    period: "Tháng này",
    tourType: "Tất cả loại tour",
    operator: "Tất cả NVĐH",
    fromDate: "2026-03-01",
    toDate: "2026-03-31",
    search: "",
  });
  const [payload, setPayload] = useState<OperatorDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<(typeof TOUR_STATUSES)[number]>("Đang diễn ra");
  const [activePayment, setActivePayment] = useState<"Chưa thanh toán" | "Đã cọc" | "Đã thanh toán đủ">("Chưa thanh toán");
  const [activeBooking, setActiveBooking] = useState<"Phiếu chưa xác nhận" | "Phiếu đã xác nhận">("Phiếu chưa xác nhận");

  const visibleStatusRows = useMemo(
    () =>
      (statusRows[activeStatus] ?? []).filter((row) => {
        const byOperator = filters.operator === "Tất cả NVĐH" || row.operator === filters.operator;
        const bySearch = filters.search.trim() === "" || row.code.toLowerCase().includes(filters.search.toLowerCase()) || row.tourName.toLowerCase().includes(filters.search.toLowerCase());
        return byOperator && bySearch;
      }),
    [activeStatus, filters],
  );
  const visiblePaymentRows = useMemo(() => servicePaymentRows[activePayment] ?? [], [activePayment]);
  const visibleBookingRows = useMemo(() => bookingRowsByStatus[activeBooking] ?? [], [activeBooking]);
  const bookingStatusParam = activeBooking === "Phiếu chưa xác nhận" ? "SENT" : "CONFIRMED";

  useEffect(() => {
    let mounted = true;
    getOperatorDashboard()
      .then((res) => { if (mounted) setPayload(res); })
      .catch(() => { if (mounted) setError("Không tải được dữ liệu dashboard"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setManyFilters({
      period: params.get("period") ?? "Tháng này",
      tourType: params.get("tourType") ?? "Tất cả loại tour",
      operator: params.get("operator") ?? "Tất cả NVĐH",
      fromDate: params.get("fromDate") ?? "2026-03-01",
      toDate: params.get("toDate") ?? "2026-03-31",
      search: params.get("search") ?? "",
    });
  }, [setManyFilters]);

  useEffect(() => {
    const params = new URLSearchParams(filters);
    window.history.replaceState({}, "", `/dashboard/operator?${params.toString()}`);
  }, [filters]);

  return (
    <>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Dashboard NV Điều hành</h2>
              <p className="text-sm text-muted-foreground">Theo dõi trạng thái tour, thanh toán dịch vụ và phiếu đặt</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <NativeSelect className="w-full" value={filters.period} onChange={(e) => updateFilter("period", e.target.value)}>
                <option>Tháng này</option>
                <option>Tuần này</option>
                <option>Hôm nay</option>
              </NativeSelect>
              <NativeSelect className="w-full" value={filters.tourType} onChange={(e) => updateFilter("tourType", e.target.value)}>
                <option>Tất cả loại tour</option>
                <option>Trong nước</option>
                <option>Quốc tế</option>
                <option>Inbound</option>
              </NativeSelect>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="bg-card/80 pl-8" placeholder="Tìm mã/tên tour" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Input type="date" value={filters.fromDate} onChange={(e) => updateFilter("fromDate", e.target.value)} />
            <Input type="date" value={filters.toDate} onChange={(e) => updateFilter("toDate", e.target.value)} />
            <NativeSelect className="w-full" value={filters.operator} onChange={(e) => updateFilter("operator", e.target.value)}>
              <option>Tất cả NVĐH</option>
              <option>Nguyễn Văn A</option>
              <option>Trần Thị B</option>
              <option>Lê Quốc C</option>
            </NativeSelect>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          { ...operatorCards[0], icon: Map, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
          { ...operatorCards[1], icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
          { ...operatorCards[2], icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
          { ...operatorCards[3], icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
        ] as const).map((item) => (
          <div key={item.title} className={cn("rounded-xl border p-4", item.border, item.bg)}>
            <div className="flex items-center justify-between">
              <p className={cn("text-xs font-medium", item.color)}>{item.title}</p>
              <item.icon className={cn("size-4", item.color)} />
            </div>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight tabular-nums", item.color)}>{item.value}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={BarChart3} title="Biểu đồ tổng quan" />
          <p className="text-xs text-muted-foreground">So sánh số tour và lợi nhuận theo khách lẻ/đoàn</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {chartData.map((item) => {
              const percent = Math.round((item.value / item.total) * 100);
              return (
                <div key={item.label} className="rounded-xl border border-border/70 bg-card p-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold tabular-nums">{item.value}</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-muted/60">
                    <div className="h-2.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 10 tour status cards */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Layers} title="10 trạng thái tour" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {TOUR_STATUSES.map((status, index) => {
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                  className={cn(
                    "group relative min-h-[122px] rounded-xl border bg-card p-3.5 text-left transition-all",
                    isActive
                      ? "border-primary/50 ring-2 ring-primary/25 shadow-md"
                      : "border-border/70 hover:border-primary/20 hover:shadow-sm",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{status}</p>
                    {isActive ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Đang chọn
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        #{8 + index}
                      </span>
                    )}
                  </div>
                  <p className={cn("mt-2 text-[36px] leading-none font-semibold tracking-tight", isActive ? "text-primary" : "text-foreground")}>
                    {payload?.tourStatuses[index]?.count ?? 8 + index}
                  </p>
                  <div className="mt-3">
                    <span
                      className={cn(
                        "inline-flex h-7 items-center rounded-md px-2 text-[11px] font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "border border-primary/30 bg-background text-primary hover:bg-primary/5",
                      )}
                    >
                      {isActive ? "Đang hiển thị" : "Mở list đã lọc"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment & Booking quick stats */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={CreditCard} title="Thanh toán dịch vụ" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentCards.map((item, idx) => {
                const isActive = activePayment === item.title;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActivePayment(item.title as typeof activePayment)}
                    className={cn(
                      "rounded-xl border bg-card p-3 text-left transition-all",
                      isActive ? "ring-2 ring-primary/30 border-primary/30" : "border-border hover:border-primary/20",
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                    <p className={cn("mt-2 text-4xl leading-none font-semibold", TONE_CLASS[item.tone])}>
                      {payload?.paymentStatuses[idx]?.count ?? item.value}
                    </p>
                    {item.hint && <p className="mt-1.5 text-xs text-muted-foreground">{item.hint}</p>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={FileCheck} title="Phiếu đặt dịch vụ" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {bookingCards.map((item, idx) => {
                const isActive = activeBooking === item.title;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveBooking(item.title as typeof activeBooking)}
                    className={cn(
                      "rounded-xl border bg-card p-3 text-left transition-all",
                      isActive ? "ring-2 ring-primary/35 border-primary/30" : "border-border hover:border-primary/20",
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                    <p className="mt-2 text-4xl leading-none font-semibold text-foreground">
                      {payload?.bookingStatuses[idx]?.count ?? item.value}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tour drill-down + Payment sidebar */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Drill-down tour: {activeStatus}</h3>
              <Badge variant="info">{visibleStatusRows.length} tour</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="table-head-sticky">
                  <TableHead>Mã tour</TableHead>
                  <TableHead>Tên tour</TableHead>
                  <TableHead>NVĐH</TableHead>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Ngày khởi hành</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleStatusRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Không có tour ở trạng thái này</TableCell>
                  </TableRow>
                ) : (
                  visibleStatusRows.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell className="font-medium">{row.tourName}</TableCell>
                      <TableCell>{row.operator}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{row.startDate}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/tours/${row.code}`}>
                          <Button size="sm" className="gap-1.5 text-xs"><Eye className="size-3.5" />Mở step</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Thanh toán DV:</h3>
              <Badge variant={activePayment === "Chưa thanh toán" ? "danger" : activePayment === "Đã cọc" ? "warning" : "success"}>
                {activePayment}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {visiblePaymentRows.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Không có dữ liệu</p>
            ) : (
              visiblePaymentRows.map((row) => (
                <div key={row.voucherCode} className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">{row.voucherCode}</p>
                  <p className="text-sm font-semibold">{row.tourCode}</p>
                  <p className="text-xs">{row.serviceType}</p>
                  <p className="text-xs text-muted-foreground">Hạn TT: {row.dueDate}</p>
                  <div className="mt-2">
                    <Badge variant={row.overdue === "Quá hạn" ? "danger" : row.overdue === "Sắp đến hạn" ? "warning" : "secondary"}>{row.overdue}</Badge>
                  </div>
                  <div className="mt-2">
                    <Link href={`/services?paymentStatus=${encodeURIComponent(activePayment)}&search=${encodeURIComponent(row.voucherCode)}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <ExternalLink className="size-3" />
                        Mở danh sách dịch vụ
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* Booking drill-down */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Drill-down phiếu DV: {activeBooking}</h3>
            <Badge variant="info">{visibleBookingRows.length} phiếu</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Mã tour</TableHead>
                <TableHead>NCC</TableHead>
                <TableHead>Ngày sử dụng</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBookingRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Không có phiếu</TableCell>
                </TableRow>
              ) : (
                visibleBookingRows.map((row) => (
                  <TableRow key={row.bookingCode}>
                    <TableCell className="font-mono text-xs">{row.bookingCode}</TableCell>
                    <TableCell>{row.tourCode}</TableCell>
                    <TableCell>{row.supplier}</TableCell>
                    <TableCell>{row.useDate}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/bookings?status=${bookingStatusParam}&search=${encodeURIComponent(row.bookingCode)}`}>
                        <Button size="sm" className="gap-1.5 text-xs"><Eye className="size-3.5" />Mở DS phiếu</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
