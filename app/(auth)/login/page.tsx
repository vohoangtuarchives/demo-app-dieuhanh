import { PlPanel } from "@/components/preline/layout-primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <PlPanel className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Đăng nhập hệ thống điều hành</h1>
        <p className="mt-1 text-sm text-muted-foreground">Màn hình auth placeholder cho kiến trúc route-group.</p>
        <div className="mt-4 space-y-2">
          <Input className="bg-card/80 backdrop-blur-sm" placeholder="Email" />
          <Input className="bg-card/80 backdrop-blur-sm" placeholder="Mật khẩu" type="password" />
          <Button className="w-full">Đăng nhập</Button>
        </div>
      </PlPanel>
    </main>
  );
}
