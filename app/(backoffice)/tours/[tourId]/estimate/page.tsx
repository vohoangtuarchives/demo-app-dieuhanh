"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  Hotel,
  TrendingUp,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const costItems = [
  { id: "hotel", label: "Khách sạn", icon: Hotel, value: 180000000 },
  { id: "transport", label: "Vận chuyển", icon: Truck, value: 92000000 },
  { id: "meal", label: "Ăn uống", icon: UtensilsCrossed, value: 65000000 },
];

export default function TourEstimatePage({ params }: { params: Promise<{ tourId: string }> }) {
  const { tourId } = use(params);
  const [revenue, setRevenue] = useState(510000000);
  const [costs, setCosts] = useState<Record<string, number>>({
    hotel: 180000000, transport: 92000000, meal: 65000000,
  });
  const [threshold] = useState(420000000);

  const totalCost = useMemo(() => Object.values(costs).reduce((s, v) => s + v, 0), [costs]);
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  const hasInvalid = Object.values(costs).some((v) => v < 0) || revenue < 0;
  const exceedThreshold = totalCost > threshold;
  const thresholdPercent = threshold > 0 ? Math.min(100, Math.round((totalCost / threshold) * 100)) : 0;
  const canProceed = !hasInvalid;

  return (
    <div className="grid gap-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Form dự toán tour {tourId}</h2>
              <p className="text-sm text-muted-foreground">Validate âm, vượt trần chi phí và lợi nhuận realtime theo PRD.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial overview */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-600">Doanh thu</p>
            <DollarSign className="size-4 text-blue-600" />
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600">{revenue.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-600">Tổng chi phí</p>
            <Calculator className="size-4 text-amber-600" />
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">{totalCost.toLocaleString("vi-VN")}</p>
        </div>
        <div className={cn(
          "rounded-xl border p-4",
          profit >= 0
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
        )}>
          <div className="flex items-center justify-between">
            <p className={cn("text-xs font-medium", profit >= 0 ? "text-emerald-600" : "text-red-600")}>Lợi nhuận</p>
            <TrendingUp className={cn("size-4", profit >= 0 ? "text-emerald-600" : "text-red-600")} />
          </div>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums", profit >= 0 ? "text-emerald-600" : "text-red-600")}>{profit.toLocaleString("vi-VN")}</p>
          <Badge variant={margin >= 15 ? "success" : margin >= 0 ? "warning" : "danger"} className="mt-1 text-[10px] tabular-nums">
            Margin: {margin}%
          </Badge>
        </div>
      </section>

      {/* Revenue & threshold */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
              <DollarSign className="size-3.5" />
            </div>
            <h3 className="font-semibold">Doanh thu & ngưỡng</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Doanh thu dự kiến</label>
              <Input type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} className="tabular-nums" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngưỡng chi phí (chỉ đọc)</label>
              <Input value={threshold.toLocaleString("vi-VN")} readOnly className="bg-muted/30 tabular-nums" />
            </div>
          </div>
          {/* Threshold bar */}
          <div className="rounded-lg bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sử dụng ngưỡng chi phí</span>
              <span className={cn("font-semibold tabular-nums", exceedThreshold ? "text-red-600" : "text-emerald-600")}>{thresholdPercent}%</span>
            </div>
            <Progress value={thresholdPercent} className={cn("mt-1.5 h-2", exceedThreshold && "[&>div]:bg-red-500")} />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Đã dùng: {totalCost.toLocaleString("vi-VN")}</span>
              <span>Ngưỡng: {threshold.toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
              <Calculator className="size-3.5" />
            </div>
            <h3 className="font-semibold">Chi phí theo danh mục</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {costItems.map((item) => {
              const val = costs[item.id] ?? 0;
              const pct = totalCost > 0 ? Math.round((val / totalCost) * 100) : 0;
              return (
                <div key={item.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <item.icon className="size-3.5" />{item.label}
                    </label>
                    <Badge variant="secondary" className="text-[10px] tabular-nums">{pct}%</Badge>
                  </div>
                  <Input
                    type="number"
                    value={val}
                    onChange={(e) => setCosts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                    className="mt-2 tabular-nums"
                  />
                  <div className="mt-2 h-1.5 rounded-full bg-muted/60">
                    <div className="h-1.5 rounded-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={hasInvalid ? "danger" : "success"} className="gap-1">
              {hasInvalid ? <AlertTriangle className="size-3" /> : <CheckCircle2 className="size-3" />}
              {hasInvalid ? "Có giá trị âm" : "Giá trị hợp lệ"}
            </Badge>
            <Badge variant={exceedThreshold ? "warning" : "success"} className="gap-1">
              {exceedThreshold ? <AlertTriangle className="size-3" /> : <CheckCircle2 className="size-3" />}
              {exceedThreshold ? "Vượt trần chi phí" : "Trong ngưỡng duyệt"}
            </Badge>
            <Badge variant={profit < 0 ? "danger" : "info"} className={cn("tabular-nums", profit < 0 && "animate-pulse")}>
              LN: {profit.toLocaleString("vi-VN")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button disabled={!canProceed} className="gap-1.5">
              <CheckCircle2 className="size-4" />Lưu dự toán
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/services?search=${encodeURIComponent(tourId)}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs"><ArrowRight className="size-3.5" />List dịch vụ</Button>
              </Link>
              <Link href={`/bookings?search=${encodeURIComponent(tourId)}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs"><ArrowRight className="size-3.5" />List phiếu DV</Button>
              </Link>
              <Link
                href={`/settlements?search=${encodeURIComponent(tourId)}`}
                aria-disabled={!canProceed}
                onClick={(e) => { if (!canProceed) e.preventDefault(); }}
              >
                <Button size="sm" disabled={!canProceed} className="gap-1.5 text-xs"><ArrowRight className="size-3.5" />Quyết toán</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
