import { KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8">
          {/* Logo area */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Đăng nhập hệ thống</h1>
              <p className="mt-1 text-sm text-muted-foreground">App Điều hành Tour — Back-office vận hành</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <Input placeholder="admin@company.vn" className="h-11" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mật khẩu</label>
              <Input placeholder="••••••••" type="password" className="h-11" />
            </div>
            <Button className="h-11 w-full gap-2 text-sm font-semibold">
              <LogIn className="size-4" />
              Đăng nhập
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            <span>Bảo mật bởi hệ thống nội bộ</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
