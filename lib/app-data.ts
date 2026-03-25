export type Role = "OPS" | "MANAGER";

export const BRANCHES = ["HCM", "Cần Thơ", "Hà Nội", "Cà Mau", "Quảng Bình"];

export const NAV_ITEMS = [
  { label: "Dashboard NVĐH", href: "/dashboard/operator", icon: "LayoutDashboard" },
  { label: "Dashboard Giám đốc", href: "/dashboard/manager", icon: "TrendingUp" },
  { label: "List Tour", href: "/tours", icon: "Map" },
  { label: "List Dịch vụ", href: "/services", icon: "BriefcaseBusiness" },
  { label: "List Phiếu DV", href: "/bookings", icon: "FileText" },
  { label: "Quyết toán", href: "/settlements", icon: "Wallet" },
  { label: "Cài đặt", href: "/settings", icon: "Settings2" },
] as const;

export const TOUR_STATUSES = [
  "Chờ nhận",
  "Đã nhận",
  "Đang dự toán",
  "Bàn giao HDV",
  "HDV nhận",
  "Đang diễn ra",
  "Kết thúc",
  "Đã quyết toán",
  "Chưa hoàn tiền",
  "Thành công",
] as const;

export const operatorCards = [
  { title: "Tổng tour khách lẻ", value: 82 },
  { title: "Tổng tour khách đoàn", value: 57 },
  { title: "Lợi nhuận khách lẻ", value: "4.2 tỷ" },
  { title: "Lợi nhuận khách đoàn", value: "5.1 tỷ" },
];
