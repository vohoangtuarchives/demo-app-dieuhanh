"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassPanel, GlassStat, GlassTableContainer } from "@/components/glass/glass";
import { useAppShell } from "@/components/providers/app-shell-provider";
import { TOUR_STATUSES } from "@/lib/app-data";
import { getNextStatuses, validateTransitionRequirements, type TourStatus, type WorkflowAction } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditTimeline } from "@/components/backoffice/audit-timeline";

export default function TourDetailPage({ params }: { params: { tourId: string } }) {
  const { role } = useAppShell();
  const [status, setStatus] = useState<TourStatus>("Đang diễn ra");
  const [auditItems, setAuditItems] = useState<WorkflowAction[]>([
    { from: "Chờ nhận", to: "Đã nhận", actor: "Nguyễn Văn A", at: "24/03/2026 08:14" },
    { from: "Đã nhận", to: "Đang dự toán", actor: "Nguyễn Văn A", at: "24/03/2026 09:02" },
    { from: "Đang dự toán", to: "Bàn giao HDV", actor: "Nguyễn Văn A", at: "24/03/2026 12:31" },
    { from: "Bàn giao HDV", to: "HDV nhận", actor: "HDV Minh", at: "24/03/2026 15:12" },
  ]);
  const transitionContext = useMemo(
    () => ({
      hasEstimate: true,
      hasFinalGuestList: true,
      handoverFileCount: 9,
      checklistConfirmed: true,
      settlementApproved: status !== "Đã quyết toán" ? true : false,
      refundCompleted: status === "Chưa hoàn tiền" ? false : true,
    }),
    [status]
  );
  const nextStatus = useMemo(() => getNextStatuses(status, role)[0], [role, status]);
  const requirement = useMemo(() => validateTransitionRequirements(status, transitionContext), [status, transitionContext]);

  const transition = () => {
    if (!nextStatus || !requirement.valid) return;
    setAuditItems((prev) => [
      ...prev,
      {
        from: status,
        to: nextStatus,
        actor: role === "MANAGER" ? "Quản lý" : "NV Điều hành",
        at: new Date().toLocaleString("vi-VN"),
        note: "Chuyển trạng thái từ giao diện tour detail",
      },
    ]);
    setStatus(nextStatus);
  };

  return (
    <>
      <GlassPanel>
        <h2 className="text-lg font-semibold">Tour Detail - {params.tourId}</h2>
        <p className="text-sm text-muted-foreground">Mã tour | Loại tour | Loại khách | Chi nhánh | Ngày KH-KT | Số khách | NVĐH</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <GlassStat title="Doanh thu dự kiến" value="510,000,000" />
          <GlassStat title="Chi phí dự kiến" value="441,000,000" />
          <GlassStat title="LN dự kiến" value="69,000,000" />
          <GlassStat title="Số khách" value="19" />
        </div>
      </GlassPanel>

      <GlassPanel>
        <div className="grid gap-2 md:grid-cols-5 xl:grid-cols-10">
          {TOUR_STATUSES.map((item, idx) => (
            <div key={item} className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  TOUR_STATUSES.indexOf(status) >= idx ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {idx + 1}
              </span>
              <span className="text-xs">{item}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <h3 className="font-semibold">Trạng thái hiện tại: {status}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Vai trò hiện tại: <Badge variant={role === "MANAGER" ? "info" : "secondary"}>{role}</Badge>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/tours/${params.tourId}/estimate`} className="text-sm font-medium text-primary hover:underline">
            Mở form dự toán
          </Link>
          {!requirement.valid ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-700">
              Thiếu dữ liệu bắt buộc: {requirement.missing.join("; ")}
            </div>
          ) : null}
          {nextStatus && requirement.valid ? (
            <Button onClick={transition}>
              Chuyển sang: {nextStatus}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Không có transition hợp lệ cho vai trò hiện tại.</p>
          )}
        </div>
      </GlassPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassPanel>
          <h3 className="font-semibold">Tabs theo trạng thái hiện tại</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            <li>Lịch trình tour</li>
            <li>Chiết tính tour</li>
            <li>Danh sách đơn hàng</li>
            <li>Danh sách khách hàng</li>
            <li>Bảng dự toán</li>
          </ul>
        </GlassPanel>
        <GlassPanel>
          <h3 className="font-semibold">Hồ sơ bàn giao HDV (9 files)</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Lịch trình, Chiết tính, Đơn hàng, Khách hàng, Dự toán, BB dụng cụ, HĐ HDV, Phiếu điều tour, QR đánh giá.
          </p>
        </GlassPanel>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassTableContainer>
          <div className="p-3 pb-0">
            <h3 className="font-semibold">Checklist HDV</h3>
          </div>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Hạng mục</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Đã xem lịch trình</TableCell>
                <TableCell><Badge variant="success">Hoàn thành</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Đã gọi khách</TableCell>
                <TableCell><Badge variant="warning">Đang làm</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Đã xác nhận DV</TableCell>
                <TableCell><Badge variant="danger">Chưa xong</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Đã gọi tài xế</TableCell>
                <TableCell><Badge variant="success">Hoàn thành</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </GlassTableContainer>

        <GlassTableContainer>
          <div className="p-3 pb-0">
            <h3 className="font-semibold">Dịch vụ phát sinh trong tour</h3>
          </div>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="table-head-sticky">
                <TableHead>Dịch vụ</TableHead>
                <TableHead>NCC</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>TT thanh toán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Nhà hàng</TableCell>
                <TableCell>Thai Food Center</TableCell>
                <TableCell>18,000,000</TableCell>
                <TableCell><Badge variant="warning">Đã cọc</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Xe du lịch</TableCell>
                <TableCell>Bangkok Bus</TableCell>
                <TableCell>12,000,000</TableCell>
                <TableCell><Badge variant="success">Đã thanh toán đủ</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </GlassTableContainer>
      </section>

      <GlassPanel>
        <h3 className="font-semibold">Audit timeline</h3>
        <p className="text-xs text-muted-foreground">Lịch sử thao tác trạng thái tour theo actor và thời điểm.</p>
        <div className="mt-3">
          <AuditTimeline items={auditItems} />
        </div>
      </GlassPanel>
    </>
  );
}
