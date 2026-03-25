"use client";

import Link from "next/link";
import { PlCard, PlPanel } from "@/components/preline/layout-primitives";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      <PlPanel>
        <h2 className="text-lg font-semibold">Trung tâm Dashboard</h2>
        <p className="text-sm text-muted-foreground">Chọn dashboard phù hợp theo vai trò để theo dõi và điều hành.</p>
      </PlPanel>
      <section className="grid gap-4 md:grid-cols-2">
        <PlCard className="p-4">
          <h3 className="font-semibold">Dashboard NV Điều hành</h3>
          <p className="mt-1 text-sm text-muted-foreground">Theo dõi trạng thái tour, thanh toán dịch vụ và phiếu đặt.</p>
          <div className="mt-3">
            <Link href="/dashboard/operator">
              <Button>Mở dashboard OPS</Button>
            </Link>
          </div>
        </PlCard>
        <PlCard className="p-4">
          <h3 className="font-semibold">Dashboard Giám đốc/Quản lý</h3>
          <p className="mt-1 text-sm text-muted-foreground">Theo dõi KPI phân khúc, hiệu suất NVĐH và approval queue.</p>
          <div className="mt-3">
            <Link href="/dashboard/manager">
              <Button variant="secondary">Mở dashboard Manager</Button>
            </Link>
          </div>
        </PlCard>
      </section>
    </div>
  );
}
