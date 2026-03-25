"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Trung tâm Dashboard</h2>
              <p className="text-sm text-muted-foreground">Chọn dashboard phù hợp theo vai trò để theo dõi và điều hành.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <LayoutDashboard className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">Dashboard NV Điều hành</h3>
                <Badge variant="info" className="mt-1 text-[10px]">OPS</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="size-3.5 shrink-0" />Trạng thái tour, dịch vụ & phiếu đặt
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-3.5 shrink-0" />Quản lý HDV và nhà cung cấp
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/operator">
                <Button className="gap-1.5">
                  Mở dashboard OPS
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-emerald-400/30 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">Dashboard Giám đốc/Quản lý</h3>
                <Badge variant="success" className="mt-1 text-[10px]">MANAGER</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="size-3.5 shrink-0" />KPI phân khúc & hiệu suất NVĐH
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0" />Approval queue & quyết toán
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/manager">
                <Button variant="secondary" className="gap-1.5">
                  Mở dashboard Manager
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
