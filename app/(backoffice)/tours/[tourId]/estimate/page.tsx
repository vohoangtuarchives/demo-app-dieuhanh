"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlPanel, PlTableShell } from "@/components/preline/layout-primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const costItems = [
  { id: "hotel", label: "Khách sạn", value: 180000000 },
  { id: "transport", label: "Vận chuyển", value: 92000000 },
  { id: "meal", label: "Ăn uống", value: 65000000 },
];

export default function TourEstimatePage({ params }: { params: { tourId: string } }) {
  const [revenue, setRevenue] = useState(510000000);
  const [costs, setCosts] = useState<Record<string, number>>({
    hotel: 180000000,
    transport: 92000000,
    meal: 65000000,
  });
  const [threshold] = useState(420000000);

  const totalCost = useMemo(() => Object.values(costs).reduce((s, v) => s + v, 0), [costs]);
  const profit = revenue - totalCost;
  const hasInvalid = Object.values(costs).some((v) => v < 0) || revenue < 0;
  const exceedThreshold = totalCost > threshold;
  const canProceed = !hasInvalid;

  return (
    <div className="grid gap-4">
      <PlPanel>
        <h2 className="text-lg font-semibold">Form dự toán tour {params.tourId}</h2>
        <p className="text-sm text-muted-foreground">Validate âm, vượt trần chi phí và lợi nhuận realtime theo PRD.</p>
      </PlPanel>

      <PlTableShell>
        <div className="grid gap-3 p-3 md:grid-cols-2">
          <Input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            placeholder="Doanh thu dự kiến"
          />
          <Input value={threshold} readOnly />
        </div>
        <div className="grid gap-3 p-3 md:grid-cols-3">
          {costItems.map((item) => (
            <Input
              key={item.id}
              type="number"
              value={costs[item.id]}
              onChange={(e) => setCosts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
              placeholder={item.label}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <Badge variant={hasInvalid ? "danger" : "success"}>{hasInvalid ? "Có giá trị âm" : "Giá trị hợp lệ"}</Badge>
          <Badge variant={exceedThreshold ? "warning" : "success"}>
            {exceedThreshold ? "Vượt trần chi phí" : "Trong ngưỡng duyệt"}
          </Badge>
          <Badge variant={profit < 0 ? "danger" : "info"}>LN realtime: {profit.toLocaleString("vi-VN")}</Badge>
        </div>
        <div className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button disabled={!canProceed}>Lưu dự toán</Button>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/services?search=${encodeURIComponent(params.tourId)}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Đi tới list dịch vụ
              </Link>
              <Link
                href={`/bookings?search=${encodeURIComponent(params.tourId)}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Đi tới list phiếu DV
              </Link>
              <Link
                href={`/settlements?search=${encodeURIComponent(params.tourId)}`}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                aria-disabled={!canProceed}
                onClick={(e) => {
                  if (!canProceed) e.preventDefault();
                }}
              >
                Đi tới quyết toán
              </Link>
            </div>
          </div>
        </div>
      </PlTableShell>
    </div>
  );
}
