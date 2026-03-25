"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FilePlus2,
  FileUp,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "info", label: "Thông tin DV", icon: Package },
  { key: "payment", label: "Thanh toán", icon: CreditCard },
  { key: "docs", label: "Tài liệu", icon: FileUp },
  { key: "confirm", label: "Xác nhận", icon: CheckCircle2 },
] as const;

export default function BookingNewPage() {
  const [supplier, setSupplier] = useState("Bangkok Stay");
  const [quantity, setQuantity] = useState(10);
  const [unitPrice, setUnitPrice] = useState(2500000);
  const [deposit, setDeposit] = useState(0);
  const [dueDate, setDueDate] = useState("2026-03-31");
  const [proof, setProof] = useState("");

  const total = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);
  const invalidDeposit = deposit < 0 || deposit > total;
  const missingDueDate = dueDate.trim() === "";
  const depositPercent = total > 0 ? Math.min(100, Math.round((deposit / total) * 100)) : 0;

  const validations = [
    { ok: !invalidDeposit, label: "Tiền cọc", okText: "Hợp lệ", errText: "Không hợp lệ" },
    { ok: !missingDueDate, label: "Hạn TT", okText: "Đã nhập", errText: "Thiếu" },
    { ok: !!proof, label: "File XN", okText: "Đã đính", errText: "Chưa đính" },
  ];
  const completedSteps = [true, !invalidDeposit && !missingDueDate, !!proof, !invalidDeposit && !missingDueDate && !!proof];
  const activeStep = completedSteps.lastIndexOf(true);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FilePlus2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Form tạo phiếu dịch vụ</h2>
              <p className="text-sm text-muted-foreground">Điền theo 4 bước: Thông tin dịch vụ, thanh toán, tài liệu, xác nhận.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step indicator */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {STEPS.map((step, idx) => {
              const done = completedSteps[idx];
              const isCurrent = idx === activeStep;
              return (
                <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2">
                  <div className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    done ? "bg-emerald-600 text-white" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}>
                    {done ? <CheckCircle2 className="size-4" /> : <step.icon className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("truncate text-xs font-medium", done ? "text-emerald-600" : isCurrent ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                  </div>
                  {idx < STEPS.length - 1 && <div className={cn("mx-2 h-px flex-1", done ? "bg-emerald-300" : "bg-border")} />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Service info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-3.5" />
            </div>
            <h3 className="font-semibold">1) Thông tin dịch vụ</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nhà cung cấp</label>
              <NativeSelect value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                <option>Bangkok Stay</option><option>Ẩm Thực Sông Nước</option><option>An Bình Transport</option>
              </NativeSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />Hạn thanh toán</span>
              </label>
              <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Số lượng</label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="VD: 10" className="tabular-nums" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Đơn giá (VND)</label>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} placeholder="VD: 2,500,000" className="tabular-nums" />
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tổng giá trị</span>
              <span className="text-xl font-bold tabular-nums text-primary">{total.toLocaleString("vi-VN")} <span className="text-xs font-normal text-muted-foreground">VND</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Payment & docs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-3.5" />
            </div>
            <h3 className="font-semibold">2) Thanh toán và tài liệu</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tiền cọc (VND)</label>
              <Input type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} placeholder="VD: 5,000,000" className="tabular-nums" />
              {invalidDeposit && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="size-3" />Tiền cọc phải từ 0 đến {total.toLocaleString("vi-VN")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1"><FileUp className="size-3" />Mã file xác nhận</span>
              </label>
              <Input value={proof} onChange={(e) => setProof(e.target.value)} placeholder="VD: FILE-CNF-001" />
            </div>
          </div>
          {/* Deposit progress */}
          <div className="rounded-lg bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tỷ lệ đặt cọc</span>
              <span className={cn("font-semibold tabular-nums", depositPercent >= 50 ? "text-emerald-600" : "text-amber-600")}>{depositPercent}%</span>
            </div>
            <Progress value={depositPercent} className="mt-1.5 h-2" />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Cọc: {deposit.toLocaleString("vi-VN")}</span>
              <span>Còn lại: {Math.max(0, total - deposit).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary & submit */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info" className="gap-1"><BriefcaseBusiness className="size-3" />NCC: {supplier}</Badge>
            <Badge variant="info" className="tabular-nums">Tổng: {total.toLocaleString("vi-VN")}</Badge>
            {validations.map((v) => (
              <Badge key={v.label} variant={v.ok ? "success" : "danger"} className="gap-1">
                {v.ok ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                {v.label}: {v.ok ? v.okText : v.errText}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Mẹo: nhập mã file trước khi tạo phiếu để xác nhận NCC ngay.</p>
            <Button disabled={invalidDeposit || missingDueDate} className="gap-1.5">
              <FilePlus2 className="size-4" />Tạo phiếu DV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
