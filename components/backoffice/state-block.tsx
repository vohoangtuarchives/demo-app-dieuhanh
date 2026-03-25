import { PlPanel } from "@/components/preline/layout-primitives";

export function LoadingBlock() {
  return <PlPanel className="text-sm text-muted-foreground">Đang tải dữ liệu...</PlPanel>;
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <PlPanel className="text-sm status-danger">
      Lỗi: {message}
    </PlPanel>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  return <p className="p-6 text-sm text-muted-foreground">{message}</p>;
}
