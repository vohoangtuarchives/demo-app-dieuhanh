"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Bell,
  ExternalLink,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/providers/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { AlertCenter } from "@/components/backoffice/alert-center";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { getManagerDashboard } from "@/lib/api/dashboard-service";
import type { ManagerDashboardPayload, ManagerSegment } from "@/lib/api/contracts";
import { ErrorBlock, LoadingBlock } from "@/components/backoffice/state-block";
import { cn } from "@/lib/utils";

const SEGMENTS: ManagerSegment[] = ["Trong nước", "Quốc tế", "Inbound"];

const alerts = [
  { title: "Dịch vụ quá hạn thanh toán tour QT-HN-24012", level: "danger" as const, owner: "Trần Thị B", due: "Hôm nay" },
  { title: "Phiếu DV chưa xác nhận BK-1204", level: "warning" as const, owner: "Trần Thị B", due: "24/03/2026" },
  { title: "Settlement chờ duyệt TN-HCM-24031", level: "info" as const, owner: "Nguyễn Văn A", due: "25/03/2026" },
];

function SectionHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {badge}
    </div>
  );
}

function HorizontalBar({ label, value, maxValue, formattedValue, color = "bg-primary" }: {
  label: string;
  value: number;
  maxValue: number;
  formattedValue: string;
  color?: string;
}) {
  const width = Math.max(Math.round((value / maxValue) * 100), 8);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{formattedValue}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/60">
        <div className={cn("h-2.5 rounded-full transition-all duration-500", color)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function buildToursLink(branch: string, segment: ManagerSegment, customerType: string) {
  const query = new URLSearchParams({
    branch,
    tourType: segment,
    customerType,
    status: "Tất cả trạng thái",
    search: "",
  });
  return `/tours?${query.toString()}`;
}

function buildServicesLink(paymentStatus: string) {
  const query = new URLSearchParams({
    serviceType: "Tất cả",
    paymentStatus,
    supplier: "Tất cả",
    search: "",
  });
  return `/services?${query.toString()}`;
}

function buildBookingsLink(status: string) {
  const query = new URLSearchParams({
    serviceType: "Tất cả",
    status,
    supplier: "Tất cả",
    search: "",
  });
  return `/bookings?${query.toString()}`;
}

export default function ManagerDashboardPage() {
  const [payload, setPayload] = useState<ManagerDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<ManagerSegment>("Trong nước");
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useQueryFilters({
    branch: "Tất cả chi nhánh",
    period: "Tháng này",
    fromDate: "2026-03-01",
    toDate: "2026-03-31",
    tourType: "Tất cả loại tour",
    customerType: "Tất cả loại khách",
  });

  useEffect(() => {
    let mounted = true;
    getManagerDashboard()
      .then((res) => { if (mounted) setPayload(res); })
      .catch(() => { if (mounted) setError("Không tải được dashboard giám đốc"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const kpiRows = payload?.kpis ?? [];

  const segmentSummary = useMemo(
    () =>
      SEGMENTS.map((segment) => {
        const rows = kpiRows.filter((r) => r.segment === segment);
        return {
          segment,
          totalTours: rows.reduce((sum, r) => sum + r.tourCount, 0),
          totalProfit: rows.reduce((sum, r) => sum + r.profit, 0),
        };
      }),
    [kpiRows],
  );

  const maxTourCount = Math.max(...kpiRows.map((r) => r.tourCount), 1);
  const maxProfit = Math.max(...kpiRows.map((r) => r.profit), 1);
  const drilldownRows = kpiRows.filter((r) => r.segment === activeSegment);

  return (
    <RoleGuard allow={["MANAGER"]}>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      <UnifiedFilterBar
        title="Dashboard Giám đốc"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        rightActions={<Button size="sm" className="gap-1.5"><Download className="size-3.5" />Xuất dashboard</Button>}
      >
        <NativeSelect className="w-full" value={filters.branch} onChange={(e) => updateFilter("branch", e.target.value)}>
          <option>Tất cả chi nhánh</option>
          <option>HCM</option>
          <option>Cần Thơ</option>
          <option>Hà Nội</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.period} onChange={(e) => updateFilter("period", e.target.value)}>
          <option>Hôm nay</option>
          <option>Tuần này</option>
          <option>Tháng này</option>
          <option>Quý này</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.tourType} onChange={(e) => updateFilter("tourType", e.target.value)}>
          <option>Tất cả loại tour</option>
          <option>Trong nước</option>
          <option>Quốc tế</option>
          <option>Inbound</option>
        </NativeSelect>
        <NativeSelect className="w-full" value={filters.customerType} onChange={(e) => updateFilter("customerType", e.target.value)}>
          <option>Tất cả loại khách</option>
          <option>Lẻ</option>
          <option>Đoàn</option>
        </NativeSelect>
        <Input type="date" className="bg-card/80" value={filters.fromDate} onChange={(e) => updateFilter("fromDate", e.target.value)} />
        <Input type="date" className="bg-card/80" value={filters.toDate} onChange={(e) => updateFilter("toDate", e.target.value)} />
      </UnifiedFilterBar>

      {/* Segment selector */}
      <section className="grid gap-3 md:grid-cols-3">
        {segmentSummary.map((item) => {
          const isActive = activeSegment === item.segment;
          return (
            <button
              key={item.segment}
              type="button"
              onClick={() => setActiveSegment(item.segment)}
              className={cn(
                "group relative rounded-xl border bg-card p-4 text-left transition-all",
                isActive
                  ? "border-primary/40 ring-2 ring-primary/20 shadow-md"
                  : "border-border hover:border-primary/20 hover:shadow-sm",
              )}
            >
              {isActive && (
                <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Đang chọn
                </span>
              )}
              <p className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.segment} (Lẻ + Đoàn)
              </p>
              <p className={cn("mt-1.5 text-2xl font-bold tracking-tight", isActive ? "text-primary" : "text-foreground")}>
                {item.totalTours}
                <span className="ml-1 text-sm font-normal text-muted-foreground">tour</span>
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                LN: {(item.totalProfit / 1_000_000_000).toFixed(1)} tỷ
              </p>
            </button>
          );
        })}
      </section>

      {/* Charts: tour count & profit */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={BarChart3} title="Số tour theo phân khúc" />
          </CardHeader>
          <CardContent className="space-y-4">
            {kpiRows.map((item) => (
              <button
                key={`${item.segment}-${item.customerType}-tour`}
                type="button"
                onClick={() => setActiveSegment(item.segment)}
                className="w-full text-left"
              >
                <HorizontalBar
                  label={`${item.segment} — ${item.customerType}`}
                  value={item.tourCount}
                  maxValue={maxTourCount}
                  formattedValue={`${item.tourCount} tour`}
                />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={TrendingUp} title="Lợi nhuận theo phân khúc" />
          </CardHeader>
          <CardContent className="space-y-4">
            {kpiRows.map((item) => (
              <button
                key={`${item.segment}-${item.customerType}-profit`}
                type="button"
                onClick={() => setActiveSegment(item.segment)}
                className="w-full text-left"
              >
                <HorizontalBar
                  label={`${item.segment} — ${item.customerType}`}
                  value={item.profit}
                  maxValue={maxProfit}
                  formattedValue={`${item.profit.toLocaleString("vi-VN")} đ`}
                  color="bg-emerald-500"
                />
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Drill-down by segment */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={ExternalLink}
            title={`Drill-down: ${activeSegment} theo loại khách`}
            badge={<Badge variant="info">{filters.branch}</Badge>}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Phân khúc</TableHead>
                <TableHead>Loại khách</TableHead>
                <TableHead>Số tour</TableHead>
                <TableHead>Lợi nhuận</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drilldownRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                drilldownRows.map((row) => (
                  <TableRow key={`${row.segment}-${row.customerType}`}>
                    <TableCell>{row.segment}</TableCell>
                    <TableCell>{row.customerType}</TableCell>
                    <TableCell><Badge variant="secondary">{row.tourCount}</Badge></TableCell>
                    <TableCell className="tabular-nums">{row.profit.toLocaleString("vi-VN")} đ</TableCell>
                    <TableCell className="text-right">
                      <Link href={buildToursLink(filters.branch, row.segment, row.customerType)}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <ExternalLink className="size-3" />
                          Mở list đã lọc
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operator performance */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Users}
            title="Hiệu suất theo NVĐH"
            badge={<Badge variant="info">{filters.branch}</Badge>}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Nhân viên điều hành</TableHead>
                <TableHead>Tổng tour</TableHead>
                <TableHead>Chờ DH</TableHead>
                <TableHead>Dự toán</TableHead>
                <TableHead>Bàn giao</TableHead>
                <TableHead>Đang diễn ra</TableHead>
                <TableHead>Kết thúc</TableHead>
                <TableHead>Đã QT</TableHead>
                <TableHead>Hoàn tất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payload?.performanceByOperator ?? []).map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell><Badge variant="secondary">{row.total}</Badge></TableCell>
                  <TableCell>{row.waiting}</TableCell>
                  <TableCell>{row.budgeting}</TableCell>
                  <TableCell>{row.handover}</TableCell>
                  <TableCell>{row.running}</TableCell>
                  <TableCell>{row.ended}</TableCell>
                  <TableCell>{row.settled}</TableCell>
                  <TableCell>{row.done}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment & booking tracking */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <SectionHeader icon={CreditCard} title="Thanh toán DV theo NVĐH" />
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="table-head-sticky">
                  <TableHead>Tên ĐH</TableHead>
                  <TableHead>Chưa TT</TableHead>
                  <TableHead>Đã cọc</TableHead>
                  <TableHead>TT đủ</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payload?.paymentByOperator ?? []).map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell><Badge variant="danger">{row.unpaid}</Badge></TableCell>
                    <TableCell><Badge variant="warning">{row.deposited}</Badge></TableCell>
                    <TableCell><Badge variant="success">{row.full}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={buildServicesLink("Chưa thanh toán")}>
                          <Button variant="outline" size="sm" className="text-xs">Unpaid</Button>
                        </Link>
                        <Link href={buildServicesLink("Đã cọc")}>
                          <Button variant="outline" size="sm" className="text-xs">Deposited</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionHeader icon={FileCheck} title="Phiếu đặt DV theo NVĐH" />
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="table-head-sticky">
                  <TableHead>Tên ĐH</TableHead>
                  <TableHead>Đã xác nhận</TableHead>
                  <TableHead>Chưa xác nhận</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payload?.bookingByOperator ?? []).map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell><Badge variant="success">{row.confirmed}</Badge></TableCell>
                    <TableCell><Badge variant="warning">{row.pending}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={buildBookingsLink("CONFIRMED")}>
                          <Button variant="outline" size="sm" className="text-xs">Confirmed</Button>
                        </Link>
                        <Link href={buildBookingsLink("SENT")}>
                          <Button variant="outline" size="sm" className="text-xs">Pending</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Approval queue */}
      <Card>
        <CardHeader>
          <SectionHeader icon={ShieldCheck} title="Approval queue (ngoại lệ tài chính / quyết toán vượt ngưỡng)" />
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Mã đề nghị</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>NVĐH</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Ngưỡng</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payload?.approvalQueue ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Không có yêu cầu chờ duyệt</TableCell>
                </TableRow>
              ) : (
                (payload?.approvalQueue ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell><Badge variant={row.type === "SETTLEMENT" ? "info" : "warning"}>{row.type}</Badge></TableCell>
                    <TableCell>{row.tourCode}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell className="tabular-nums">{row.amount.toLocaleString("vi-VN")}</TableCell>
                    <TableCell className="tabular-nums">{row.threshold.toLocaleString("vi-VN")}</TableCell>
                    <TableCell>{row.submittedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm">Duyệt</Button>
                        <Button variant="destructive" size="sm">Từ chối</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert center */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Bell} title="Alert center vận hành" />
        </CardHeader>
        <CardContent>
          <AlertCenter items={alerts} />
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
