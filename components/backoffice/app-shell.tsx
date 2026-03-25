"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANCHES, NAV_ITEMS } from "@/lib/app-data";
import { useAppShell } from "@/components/providers/app-shell-provider";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { branch, setBranch, role, setRole } = useAppShell();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f7ff_0%,#edf1ff_28%,#e9eeff_58%,#e7ecff_100%)] p-3 md:p-4 dark:bg-none dark:bg-muted/40">
      <div className="mx-auto grid grid-cols-12 gap-3 md:gap-4">
        <aside className="glass-panel col-span-12 p-4 lg:col-span-3 xl:col-span-2">
          <h1 className="text-lg font-semibold">App Điều hành Tour</h1>
          <p className="text-xs text-muted-foreground">Back-office vận hành</p>

          <label className="mt-4 block text-xs font-medium">Chi nhánh</label>
          <NativeSelect className="mt-1 w-full" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {BRANCHES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </NativeSelect>

          <label className="mt-3 block text-xs font-medium">Vai trò</label>
          <NativeSelect className="mt-1 w-full" value={role} onChange={(e) => setRole(e.target.value as "OPS" | "MANAGER")}>
            <option value="OPS">NV Điều hành</option>
            <option value="MANAGER">Giám đốc/Quản lý</option>
          </NativeSelect>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Điều hướng</p>
            <Badge variant={role === "MANAGER" ? "info" : "secondary"}>{role === "MANAGER" ? "Manager" : "OPS"}</Badge>
          </div>
          <nav className="mt-2 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/80 hover:bg-white/75 hover:text-foreground dark:hover:bg-white/8"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="col-span-12 space-y-3 md:space-y-4 lg:col-span-9 xl:col-span-10">
          <header className="glass-panel flex flex-wrap items-center justify-between gap-2 p-3 md:p-3.5">
            <div>
              <p className="text-xs text-muted-foreground">Chi nhánh đang xem</p>
              <p className="text-sm font-semibold">{branch}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/manager">
                <Button variant="outline" size="sm" className="bg-card/80 backdrop-blur-sm">
                  Xuất báo cáo
                </Button>
              </Link>
              <Link href="/tours">
                <Button size="sm">Tạo tour mới</Button>
              </Link>
              <Link href="/bookings/new">
                <Button variant="secondary" size="sm">Tạo phiếu DV</Button>
              </Link>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
