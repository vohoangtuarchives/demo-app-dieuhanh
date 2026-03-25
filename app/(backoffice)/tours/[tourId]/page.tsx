"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  ClipboardList,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  BriefcaseBusiness,
  FileText,
  Wallet,
  MapPinned,
  Users,
  ShoppingCart,
  FolderOpen,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppShell } from "@/components/providers/app-shell-provider";
import { TOUR_STATUSES } from "@/lib/app-data";
import { getNextStatuses, validateTransitionRequirements, type TourStatus, type WorkflowAction } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditTimeline } from "@/components/backoffice/audit-timeline";
import { cn } from "@/lib/utils";

export default function TourDetailPage({ params }: { params: Promise<{ tourId: string }> }) {
  const { tourId } = use(params);
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
      settlementApproved: status !== "Đã quyết toán",
      refundCompleted: status !== "Chưa hoàn tiền",
    }),
    [status],
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

  const currentIdx = TOUR_STATUSES.indexOf(status);

  return (
    <>
      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitBranch className="size-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Tour Detail - {tourId}</h2>
              <p className="text-sm text-muted-foreground">Mã tour | Loại tour | Loại khách | Chi nhánh | Ngày KH-KT | Số khách | NVĐH</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
              <p className="text-[11px] font-medium text-blue-600">Doanh thu dự kiến</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-blue-600">510,000,000</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-[11px] font-medium text-amber-600">Chi phí dự kiến</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-amber-600">441,000,000</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-emerald-600">LN dự kiến</p>
                <Badge variant="success" className="text-[9px] tabular-nums">Margin: 14%</Badge>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">69,000,000</p>
              <Progress value={14} className="mt-1.5 h-1" />
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] font-medium text-primary">Số khách</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-primary">19 <span className="text-xs font-normal text-muted-foreground">pax</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-1">
            {TOUR_STATUSES.map((item, idx) => (
              <div key={item} className="flex items-center gap-1">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    currentIdx >= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    currentIdx === idx && "ring-2 ring-primary/30",
                  )}
                >
                  {currentIdx > idx ? <CheckCircle2 className="size-4" /> : idx + 1}
                </span>
                <span className={cn("text-xs", currentIdx === idx ? "font-semibold text-primary" : "text-muted-foreground")}>{item}</span>
                {idx < TOUR_STATUSES.length - 1 && <ArrowRight className="size-3 text-muted-foreground/50" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status & actions */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-white",
                currentIdx >= 5 ? "bg-emerald-600" : "bg-primary",
              )}>
                <span className="text-sm font-bold">{currentIdx + 1}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{status}</h3>
                  <Badge variant={role === "MANAGER" ? "info" : "secondary"} className="text-[10px]">{role}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Bước {currentIdx + 1}/{TOUR_STATUSES.length} trong quy trình
                </p>
              </div>
            </div>
            {nextStatus && requirement.valid && (
              <Button onClick={transition} className="gap-1.5">
                <ArrowRight className="size-4" />
                Chuyển sang: {nextStatus}
              </Button>
            )}
          </div>

          {!requirement.valid && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>Thiếu dữ liệu bắt buộc: {requirement.missing.join("; ")}</span>
            </div>
          )}
          {!nextStatus && requirement.valid && (
            <p className="mt-4 text-sm text-muted-foreground">Không có transition hợp lệ cho vai trò hiện tại.</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
            <Link href={`/tours/${tourId}/estimate`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Calculator className="size-3.5" />
                Mở dự toán
              </Button>
            </Link>
            <Link href={`/services?search=${encodeURIComponent(tourId)}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <BriefcaseBusiness className="size-3.5" />
                Mở list dịch vụ
              </Button>
            </Link>
            <Link href={`/bookings?search=${encodeURIComponent(tourId)}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <FileText className="size-3.5" />
                Mở list phiếu DV
              </Button>
            </Link>
            <Link href={`/settlements?search=${encodeURIComponent(tourId)}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Wallet className="size-3.5" />
                Mở quyết toán
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Content tabs & handover */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="size-4" />
              </div>
              <h3 className="font-semibold">Tabs theo trạng thái hiện tại</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {([
              { icon: MapPinned, label: "Lịch trình tour", href: null },
              { icon: Calculator, label: "Chiết tính tour", href: `/tours/${tourId}/estimate` },
              { icon: ShoppingCart, label: "Danh sách đơn hàng", href: `/bookings?search=${encodeURIComponent(tourId)}` },
              { icon: Users, label: "Danh sách khách hàng", href: `/bookings?search=${encodeURIComponent(tourId)}` },
              { icon: FileCheck, label: "Bảng dự toán", href: `/tours/${tourId}/estimate` },
            ] as const).map((tab) => (
              <div key={tab.label} className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60">
                <tab.icon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                {tab.href ? (
                  <Link href={tab.href} className="flex flex-1 items-center justify-between text-sm font-medium text-foreground group-hover:text-primary">
                    {tab.label}
                    <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">{tab.label}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
                  <FolderOpen className="size-4" />
                </div>
                <h3 className="font-semibold">Hồ sơ bàn giao HDV</h3>
              </div>
              <Badge variant="info" className="tabular-nums">9 files</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {["Lịch trình", "Chiết tính", "Đơn hàng", "Khách hàng", "Dự toán", "BB dụng cụ", "HĐ HDV", "Phiếu điều tour", "QR đánh giá"].map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <FileCheck className="size-3 text-emerald-600" />
                  {file}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklist + services */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><h3 className="font-semibold">Checklist HDV</h3></CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="table-head-sticky">
                  <TableHead>Hạng mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Đã xem lịch trình</TableCell><TableCell><Badge variant="success">Hoàn thành</Badge></TableCell></TableRow>
                <TableRow><TableCell>Đã gọi khách</TableCell><TableCell><Badge variant="warning">Đang làm</Badge></TableCell></TableRow>
                <TableRow><TableCell>Đã xác nhận DV</TableCell><TableCell><Badge variant="danger">Chưa xong</Badge></TableCell></TableRow>
                <TableRow><TableCell>Đã gọi tài xế</TableCell><TableCell><Badge variant="success">Hoàn thành</Badge></TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Dịch vụ phát sinh trong tour</h3></CardHeader>
          <CardContent className="p-0">
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
                <TableRow><TableCell>Nhà hàng</TableCell><TableCell>Thai Food Center</TableCell><TableCell className="tabular-nums">18,000,000</TableCell><TableCell><Badge variant="warning">Đã cọc</Badge></TableCell></TableRow>
                <TableRow><TableCell>Xe du lịch</TableCell><TableCell>Bangkok Bus</TableCell><TableCell className="tabular-nums">12,000,000</TableCell><TableCell><Badge variant="success">Đã thanh toán đủ</Badge></TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Audit */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <History className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold">Audit timeline</h3>
              <p className="text-xs text-muted-foreground">Lịch sử thao tác trạng thái tour theo actor và thời điểm.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AuditTimeline items={auditItems} />
        </CardContent>
      </Card>
    </>
  );
}
