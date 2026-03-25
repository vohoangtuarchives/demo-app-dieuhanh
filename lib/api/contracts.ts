export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type OperatorSummary = {
  tourCountRetail: number;
  tourCountGroup: number;
  profitRetail: number;
  profitGroup: number;
};

export type ServicePaymentStatus = "UNPAID" | "DEPOSITED" | "PAID_FULL";

export type StatusCard = {
  label: string;
  count: number;
};

export type PaymentCard = {
  label: "Chưa thanh toán" | "Đã cọc" | "Đã thanh toán đủ";
  count: number;
};

export type BookingCard = {
  label: "Phiếu chưa xác nhận" | "Phiếu đã xác nhận";
  count: number;
};

export type OperatorDashboardPayload = {
  summary: OperatorSummary;
  tourStatuses: StatusCard[];
  paymentStatuses: PaymentCard[];
  bookingStatuses: BookingCard[];
};

export type ManagerSegment = "Trong nước" | "Quốc tế" | "Inbound";
export type ManagerCustomerType = "Lẻ" | "Đoàn";

export type ManagerKpiRow = {
  segment: ManagerSegment;
  customerType: ManagerCustomerType;
  tourCount: number;
  profit: number;
};

export type ManagerOperatorPerformance = {
  name: string;
  total: number;
  waiting: number;
  budgeting: number;
  handover: number;
  running: number;
  ended: number;
  settled: number;
  done: number;
};

export type ManagerApprovalItem = {
  id: string;
  type: "SETTLEMENT" | "COST_EXCEPTION";
  tourCode: string;
  owner: string;
  amount: number;
  threshold: number;
  submittedAt: string;
};

export type ManagerDashboardPayload = {
  kpis: ManagerKpiRow[];
  performanceByOperator: ManagerOperatorPerformance[];
  paymentByOperator: { name: string; unpaid: number; deposited: number; full: number }[];
  bookingByOperator: { name: string; confirmed: number; pending: number }[];
  approvalQueue: ManagerApprovalItem[];
};
