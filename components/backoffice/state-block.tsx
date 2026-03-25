import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingBlock() {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 pt-5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tải dữ liệu...
      </CardContent>
    </Card>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex items-center gap-2 pt-5 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        Lỗi: {message}
      </CardContent>
    </Card>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  return <p className="p-6 text-sm text-muted-foreground">{message}</p>;
}
