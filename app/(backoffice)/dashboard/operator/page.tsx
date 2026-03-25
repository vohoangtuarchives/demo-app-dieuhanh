"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard, GlassPanel, GlassStat, GlassTableContainer } from "@/components/glass/glass";
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

const paymentCards = [
  { title: "Chưa thanh toán", value: 26, hint: "9 quá hạn", tone: "warning" },
  { title: "Đã cọc", value: 34, hint: "Đang theo dõi", tone: "default" },
  { title: "Đã thanh toán đủ", value: 78, hint: "Hoàn tất", tone: "success" },
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
    [activeStatus, filters]
  );
  const visiblePaymentRows = useMemo(() => servicePaymentRows[activePayment] ?? [], [activePayment]);
  const visibleBookingRows = useMemo(() => bookingRowsByStatus[activeBooking] ?? [], [activeBooking]);

  useEffect(() => {
    let mounted = true;
    getOperatorDashboard()
      .then((res) => {
        if (mounted) setPayload(res);
      })
      .catch(() => {
        if (mounted) setError("Không tải được dữ liệu dashboard");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
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

  const valueToneClass = (tone: "warning" | "success" | "default") => {
    if (tone === "warning") return "text-amber-600";
    if (tone === "success") return "text-emerald-600";
    return "text-foreground";
  };

  return (
    <>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}
      <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Dashboard NV Điều hành</h2>
            <p className="text-sm text-muted-foreground">Theo dõi trạng thái tour, thanh toán dịch vụ và phiếu đặt</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <NativeSelect className="w-full" value={filters.period} onChange={(e) => updateFilter("period", e.target.value)}>
              <option>Tháng này</option><option>Tuần này</option><option>Hôm nay</option>
            </NativeSelect>
            <NativeSelect className="w-full" value={filters.tourType} onChange={(e) => updateFilter("tourType", e.target.value)}>
              <option>Tất cả loại tour</option><option>Trong nước</option><option>Quốc tế</option><option>Inbound</option>
            </NativeSelect>
            <Input className="bg-card/80 backdrop-blur-sm" placeholder="Tìm mã/tên tour" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Input type="date" value={filters.fromDate} onChange={(e) => updateFilter("fromDate", e.target.value)} />
          <Input type="date" value={filters.toDate} onChange={(e) => updateFilter("toDate", e.target.value)} />
          <NativeSelect className="w-full" value={filters.operator} onChange={(e) => updateFilter("operator", e.target.value)}>
            <option>Tất cả NVĐH</option><option>Nguyễn Văn A</option><option>Trần Thị B</option><option>Lê Quốc C</option>
          </NativeSelect>
        </div>
      </GlassPanel>

      <section className="grid gap-3 md:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {operatorCards.map((item) => (
          <GlassStat key={item.title} title={item.title} value={item.value} />
        ))}
      </section>

      <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
        <h3 className="font-semibold">Biểu đồ tổng quan (demo)</h3>
        <p className="text-xs text-muted-foreground">So sánh số tour và lợi nhuận theo khách lẻ/đoàn</p>
        <div className="mt-4 grid gap-3 md:gap-4 lg:grid-cols-2">
          {chartData.map((item) => {
            const percent = Math.round((item.value / item.total) * 100);
            return (
              <GlassCard key={item.label} className="p-3.5 shadow-none">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
        <h3 className="font-semibold">10 trạng thái tour</h3>
        <div className="mt-4 grid gap-3 md:gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {TOUR_STATUSES.map((status, index) => (
            <GlassCard
              key={status}
              className={`interactive-card min-h-[122px] rounded-xl border bg-white/85 p-3.5 shadow-none transition-all ${
                activeStatus === status
                  ? "border-primary/70 bg-primary/5 ring-2 ring-primary/35 shadow-[0_0_0_1px_rgba(109,40,217,0.12)]"
                  : "border-border/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-medium ${activeStatus === status ? "text-primary" : "text-muted-foreground"}`}>{status}</p>
                {activeStatus === status ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] leading-none font-medium text-primary">
                    Đang chọn
                  </span>
                ) : (
                  <span className="rounded-full border border-border/70 bg-muted/50 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                    #{8 + index}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-[36px] leading-none font-semibold tracking-tight ${activeStatus === status ? "text-primary" : "text-foreground"}`}>
                {payload?.tourStatuses[index]?.count ?? 8 + index}
              </p>
              <Button
                variant={activeStatus === status ? "default" : "outline"}
                size="xs"
                className={`mt-3 h-7 rounded-md px-2 text-[11px] ${
                  activeStatus === status
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-primary/30 bg-background text-primary hover:bg-primary/5"
                }`}
                onClick={() => setActiveStatus(status)}
              >
                {activeStatus === status ? "Đang hiển thị" : "Mở list đã lọc"}
              </Button>
            </GlassCard>
          ))}
        </div>
      </GlassPanel>

      <section className="grid gap-3 md:gap-4 xl:grid-cols-2">
        <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
          <h3 className="font-semibold">Thanh toán dịch vụ</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {paymentCards.map((item, idx) => (
              <div
                key={item.title}
                onClick={() => setActivePayment(item.title as "Chưa thanh toán" | "Đã cọc" | "Đã thanh toán đủ")}
                className={`interactive-card rounded-lg ${activePayment === item.title ? "ring-2 ring-primary/30" : ""}`}
              >
                <GlassCard className="p-3 shadow-none">
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className={`mt-2 text-4xl leading-none font-semibold ${valueToneClass(item.tone as "warning" | "success" | "default")}`}>
                    {payload?.paymentStatuses[idx]?.count ?? item.value}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
          <h3 className="font-semibold">Phiếu đặt dịch vụ</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bookingCards.map((item, idx) => (
              <div
                key={item.title}
                onClick={() => setActiveBooking(item.title as "Phiếu chưa xác nhận" | "Phiếu đã xác nhận")}
                className={`interactive-card rounded-lg ${activeBooking === item.title ? "ring-2 ring-primary/35" : ""}`}
              >
                <GlassCard className="p-3 shadow-none">
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className="mt-2 text-4xl leading-none font-semibold text-foreground">{payload?.bookingStatuses[idx]?.count ?? item.value}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="grid gap-3 md:gap-4 xl:grid-cols-3">
        <GlassPanel className="xl:col-span-2 p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Drill-down tour theo trạng thái: {activeStatus}</h3>
            <Badge variant="info">{visibleStatusRows.length} tour</Badge>
          </div>
          <GlassTableContainer>
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="table-head-sticky">
                  <TableHead>Mã tour</TableHead>
                  <TableHead>Tên tour</TableHead>
                  <TableHead>NVĐH</TableHead>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Ngày khởi hành</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleStatusRows.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.tourName}</TableCell>
                    <TableCell>{row.operator}</TableCell>
                    <TableCell>{row.branch}</TableCell>
                    <TableCell>{row.startDate}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="default">
                        Mở step hiện tại
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassTableContainer>
        </GlassPanel>

        <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Thanh toán DV:</h3>
            <Badge variant={activePayment === "Chưa thanh toán" ? "danger" : activePayment === "Đã cọc" ? "warning" : "success"}>
              {activePayment}
            </Badge>
          </div>
          <div className="mt-3 space-y-3">
            {visiblePaymentRows.map((row) => (
              <GlassCard key={row.voucherCode} className="p-3 shadow-none">
                <p className="text-xs text-muted-foreground">{row.voucherCode}</p>
                <p className="text-sm font-semibold">{row.tourCode}</p>
                <p className="text-xs">{row.serviceType}</p>
                <p className="text-xs text-muted-foreground">Hạn TT: {row.dueDate}</p>
                <div className="mt-2">
                  <Badge variant={row.overdue === "Quá hạn" ? "danger" : row.overdue === "Sắp đến hạn" ? "warning" : "secondary"}>{row.overdue}</Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassPanel>
      </section>

      <GlassPanel className="p-4 md:p-5 ring-1 ring-foreground/8 shadow-none">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Drill-down phiếu DV: {activeBooking}</h3>
          <Badge variant="info">{visibleBookingRows.length} phiếu</Badge>
        </div>
        <GlassTableContainer>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Mã tour</TableHead>
                <TableHead>NCC</TableHead>
                <TableHead>Ngày sử dụng</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBookingRows.map((row) => (
                <TableRow key={row.bookingCode}>
                  <TableCell>{row.bookingCode}</TableCell>
                  <TableCell>{row.tourCode}</TableCell>
                  <TableCell>{row.supplier}</TableCell>
                  <TableCell>{row.useDate}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="default">
                      Cập nhật trạng thái
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </GlassTableContainer>
      </GlassPanel>
    </>
  );
}
