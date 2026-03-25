"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { BRANCHES, NAV_ITEMS } from "@/lib/app-data";
import { useAppShell } from "@/components/providers/app-shell-provider";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { branch, setBranch, role, setRole } = useAppShell();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileMenuOpenRef = useRef(mobileMenuOpen);
  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Defer state update to avoid "setState in effect" eslint error.
    if (!mobileMenuOpenRef.current) return;
    const id = window.setTimeout(() => setMobileMenuOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {mobileMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed bottom-0 start-0 top-0 z-[60] flex w-64 max-w-full flex-col border-e border-border bg-layer",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Menu điều hướng"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold">Menu</span>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <Link href="/dashboard/operator" className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-base font-semibold leading-tight text-foreground">App Điều hành Tour</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Back-office vận hành</p>
          </Link>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Vai trò demo</label>
              <NativeSelect className="w-full" value={role} onChange={(e) => setRole(e.target.value as "OPS" | "MANAGER")}>
                <option value="OPS">NV Điều hành</option>
                <option value="MANAGER">Giám đốc/Quản lý</option>
              </NativeSelect>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Shield className="size-3.5 shrink-0" aria-hidden />
              Điều hướng
            </span>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                role === "MANAGER"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {role === "MANAGER" ? "Manager" : "OPS"}
            </span>
          </div>

          <nav className="flex flex-col gap-0.5 pb-4" aria-label="Chính">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/90 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:ms-64">
        <header className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md md:px-6">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-layer text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            aria-label="Mở menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 min-w-24">
            <NativeSelect className="w-36" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/dashboard/manager"
              className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-border bg-layer px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Xuất báo cáo
            </Link>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center gap-x-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Tạo tour mới
            </Link>
            <Link
              href="/bookings/new"
              className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Tạo phiếu DV
            </Link>
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
