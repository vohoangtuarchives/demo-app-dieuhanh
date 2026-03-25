export function LoadingBlock() {
  return <div className="glass-panel p-4 text-sm text-muted-foreground">Đang tải dữ liệu...</div>;
}

export function ErrorBlock({ message }: { message: string }) {
  return <div className="glass-panel p-4 text-sm status-danger">Lỗi: {message}</div>;
}

export function EmptyBlock({ message }: { message: string }) {
  return <div className="glass-panel p-4 text-sm text-muted-foreground">{message}</div>;
}
