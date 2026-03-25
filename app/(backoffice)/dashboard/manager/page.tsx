"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlStat, PlTableShell } from "@/components/preline/layout-primitives";
import { RoleGuard } from "@/components/providers/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { AlertCenter } from "@/components/backoffice/alert-center";
import { UnifiedFilterBar } from "@/components/backoffice/unified-filter-bar";
import { useQueryFilters } from "@/lib/hooks/use-query-filters";
import { getManagerDashboard } from "@/lib/api/dashboard-service";
import type { ManagerDashboardPayload, ManagerSegment } from "@/lib/api/contracts";
import { ErrorBlock, LoadingBlock } from "@/components/backoffice/state-block";

const alerts = [
  { title: "Dịch vụ quá hạn thanh toán tour QT-HN-24012", level: "danger" as const, owner: "Trần Thị B", due: "Hôm nay" },
  { title: "Phiếu DV chưa xác nhận BK-1204", level: "warning" as const, owner: "Trần Thị B", due: "24/03/2026" },
  { title: "Settlement chờ duyệt TN-HCM-24031", level: "info" as const, owner: "Nguyễn Văn A", due: "25/03/2026" },
];

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
      .then((res) => {
        if (mounted) setPayload(res);
      })
      .catch(() => {
        if (mounted) setError("Không tải được dashboard giám đốc");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const kpiRows = payload?.kpis ?? [];
  const segmentSummary = useMemo(
    () =>
      (["Trong nước", "Quốc tế", "Inbound"] as ManagerSegment[]).map((segment) => {
        const rows = kpiRows.filter((item) => item.segment === segment);
        return {
          segment,
          totalTours: rows.reduce((sum, item) => sum + item.tourCount, 0),
          totalProfit: rows.reduce((sum, item) => sum + item.profit, 0),
        };
      }),
    [kpiRows]
  );
  const maxTourCount = Math.max(...kpiRows.map((item) => item.tourCount), 1);
  const maxProfit = Math.max(...kpiRows.map((item) => item.profit), 1);
  const drilldownRows = kpiRows.filter((item) => item.segment === activeSegment);
  const buildToursLink = (segment: ManagerSegment, customerType: string) => {
    const query = new URLSearchParams({
      branch: filters.branch,
      tourType: segment,
      customerType,
      status: "Tất cả trạng thái",
      search: "",
    });
    return `/tours?${query.toString()}`;
  };
  const buildServicesLink = (paymentStatus: "Chưa thanh toán" | "Đã cọc" | "Đã thanh toán đủ") => {
    const query = new URLSearchParams({
      serviceType: "Tất cả",
      paymentStatus,
      supplier: "Tất cả",
      search: "",
    });
    return `/services?${query.toString()}`;
  };
  const buildBookingsLink = (status: "CONFIRMED" | "SENT") => {
    const query = new URLSearchParams({
      serviceType: "Tất cả",
      status,
      supplier: "Tất cả",
      search: "",
    });
    return `/bookings?${query.toString()}`;
  };

  return (
    <RoleGuard allow={["MANAGER"]}>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      <UnifiedFilterBar title="Dashboard Giám đốc" hasActiveFilters={hasActiveFilters} onReset={resetFilters} rightActions={<Button size="sm">Xuất dashboard</Button>}>
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
        <input className="h-10 rounded-md border bg-card/80 px-3 text-sm" type="date" value={filters.fromDate} onChange={(e) => updateFilter("fromDate", e.target.value)} />
        <input className="h-10 rounded-md border bg-card/80 px-3 text-sm" type="date" value={filters.toDate} onChange={(e) => updateFilter("toDate", e.target.value)} />
      </UnifiedFilterBar>

      <section className="grid gap-3 md:grid-cols-3">
        {segmentSummary.map((item) => (
          <button key={item.segment} type="button" className={`rounded-xl text-left ${activeSegment === item.segment ? "ring-2 ring-primary/30" : ""}`} onClick={() => setActiveSegment(item.segment)}>
            <PlStat title={`${item.segment} (Lẻ + Đoàn)`} value={item.totalTours} hint={`LN: ${(item.totalProfit / 1000000000).toFixed(1)} tỷ`} />
          </button>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <PlTableShell>
          <div className="p-3 pb-0">
            <h3 className="font-semibold">Chart số tour theo phân khúc x loại khách</h3>
          </div>
          <div className="space-y-3 p-3">
            {kpiRows.map((item) => {
              const width = Math.max(Math.round((item.tourCount / maxTourCount) * 100), 10);
              return (
                <button key={`${item.segment}-${item.customerType}-tour`} type="button" onClick={() => setActiveSegment(item.segment)} className="w-full text-left">
                  <p className="text-xs text-muted-foreground">{item.segment} - {item.customerType}</p>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
                  </div>
                  <p className="mt-1 text-sm font-medium">{item.tourCount} tour</p>
                </button>
              );
            })}
          </div>
        </PlTableShell>

        <PlTableShell>
          <div className="p-3 pb-0">
            <h3 className="font-semibold">Chart lợi nhuận theo phân khúc x loại khách</h3>
          </div>
          <div className="space-y-3 p-3">
            {kpiRows.map((item) => {
              const width = Math.max(Math.round((item.profit / maxProfit) * 100), 10);
              return (
                <button key={`${item.segment}-${item.customerType}-profit`} type="button" onClick={() => setActiveSegment(item.segment)} className="w-full text-left">
                  <p className="text-xs text-muted-foreground">{item.segment} - {item.customerType}</p>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
                  </div>
                  <p className="mt-1 text-sm font-medium">{item.profit.toLocaleString("vi-VN")} đ</p>
                </button>
              );
            })}
          </div>
        </PlTableShell>
      </section>

      <PlTableShell>
        <div className="mb-3 flex items-center justify-between p-3 pb-0">
          <h3 className="font-semibold">Drill-down: {activeSegment} theo loại khách</h3>
          <Badge variant="info">{filters.branch}</Badge>
        </div>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="table-head-sticky">
              <TableHead>Phân khúc</TableHead>
              <TableHead>Loại khách</TableHead>
              <TableHead>Số tour</TableHead>
              <TableHead>Lợi nhuận</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drilldownRows.map((row) => (
              <TableRow key={`${row.segment}-${row.customerType}`}>
                <TableCell>{row.segment}</TableCell>
                <TableCell>{row.customerType}</TableCell>
                <TableCell><Badge variant="secondary">{row.tourCount}</Badge></TableCell>
                <TableCell>{row.profit.toLocaleString("vi-VN")}</TableCell>
                <TableCell>
                  <Link href={buildToursLink(row.segment, row.customerType)} className="text-sm font-medium text-primary hover:underline">
                    Mở list đã lọc
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PlTableShell>

      <PlTableShell>
        <div className="mb-3 flex items-center justify-between p-3 pb-0">
          <h3 className="font-semibold">Hiệu suất theo NVĐH</h3>
          <Badge variant="info">{filters.branch}</Badge>
        </div>
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
                <TableCell>{row.name}</TableCell>
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
      </PlTableShell>

      <section className="grid gap-3 xl:grid-cols-2">
        <PlTableShell>
          <div className="p-3 pb-0">
            <h3 className="font-semibold">Theo dõi thanh toán dịch vụ theo NVĐH</h3>
          </div>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Tên ĐH</TableHead>
                <TableHead>Chưa TT</TableHead>
                <TableHead>Đã cọc</TableHead>
                <TableHead>TT đủ</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payload?.paymentByOperator ?? []).map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell><Badge variant="danger">{row.unpaid}</Badge></TableCell>
                  <TableCell><Badge variant="warning">{row.deposited}</Badge></TableCell>
                  <TableCell><Badge variant="success">{row.full}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={buildServicesLink("Chưa thanh toán")} className="text-xs text-primary hover:underline">Unpaid</Link>
                      <Link href={buildServicesLink("Đã cọc")} className="text-xs text-primary hover:underline">Deposited</Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PlTableShell>

        <PlTableShell>
          <div className="p-3 pb-0">
            <h3 className="font-semibold">Theo dõi phiếu đặt DV theo NVĐH</h3>
          </div>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Tên ĐH</TableHead>
                <TableHead>Đã xác nhận</TableHead>
                <TableHead>Chưa xác nhận</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payload?.bookingByOperator ?? []).map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell><Badge variant="success">{row.confirmed}</Badge></TableCell>
                  <TableCell><Badge variant="warning">{row.pending}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={buildBookingsLink("CONFIRMED")} className="text-xs text-primary hover:underline">Confirmed</Link>
                      <Link href={buildBookingsLink("SENT")} className="text-xs text-primary hover:underline">Pending</Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PlTableShell>
      </section>

      <PlTableShell>
        <div className="p-3 pb-0">
          <h3 className="font-semibold">Approval queue (ngoại lệ tài chính/quyết toán vượt ngưỡng)</h3>
        </div>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(payload?.approvalQueue ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell><Badge variant={row.type === "SETTLEMENT" ? "info" : "warning"}>{row.type}</Badge></TableCell>
                <TableCell>{row.tourCode}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>{row.amount.toLocaleString("vi-VN")}</TableCell>
                <TableCell>{row.threshold.toLocaleString("vi-VN")}</TableCell>
                <TableCell>{row.submittedAt}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm">Duyệt</Button>
                  <Button variant="destructive" size="sm">Từ chối</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PlTableShell>

      <PlTableShell>
        <div className="p-3 pb-0">
          <h3 className="font-semibold">Alert center vận hành</h3>
        </div>
        <div className="p-3">
          <AlertCenter items={alerts} />
        </div>
      </PlTableShell>
    </RoleGuard>
  );
}
