import type { ManagerDashboardPayload, OperatorDashboardPayload } from "./contracts";

export async function getOperatorDashboardMock(): Promise<OperatorDashboardPayload> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return {
    summary: {
      tourCountRetail: 82,
      tourCountGroup: 57,
      profitRetail: 4200000000,
      profitGroup: 5100000000,
    },
    tourStatuses: [
      { label: "Chờ nhận", count: 8 },
      { label: "Đã nhận", count: 9 },
      { label: "Đang dự toán", count: 10 },
      { label: "Bàn giao HDV", count: 11 },
      { label: "HDV nhận", count: 12 },
      { label: "Đang diễn ra", count: 13 },
      { label: "Kết thúc", count: 14 },
      { label: "Đã quyết toán", count: 15 },
      { label: "Chưa hoàn tiền", count: 16 },
      { label: "Thành công", count: 17 },
    ],
    paymentStatuses: [
      { label: "Chưa thanh toán", count: 26 },
      { label: "Đã cọc", count: 34 },
      { label: "Đã thanh toán đủ", count: 78 },
    ],
    bookingStatuses: [
      { label: "Phiếu chưa xác nhận", count: 19 },
      { label: "Phiếu đã xác nhận", count: 81 },
    ],
  };
}

export async function getManagerDashboardMock(): Promise<ManagerDashboardPayload> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    kpis: [
      { segment: "Trong nước", customerType: "Lẻ", tourCount: 48, profit: 1600000000 },
      { segment: "Trong nước", customerType: "Đoàn", tourCount: 44, profit: 2000000000 },
      { segment: "Quốc tế", customerType: "Lẻ", tourCount: 14, profit: 2100000000 },
      { segment: "Quốc tế", customerType: "Đoàn", tourCount: 14, profit: 2700000000 },
      { segment: "Inbound", customerType: "Lẻ", tourCount: 5, profit: 320000000 },
      { segment: "Inbound", customerType: "Đoàn", tourCount: 10, profit: 580000000 },
    ],
    performanceByOperator: [
      { name: "Nguyễn Văn A", total: 15, waiting: 2, budgeting: 3, handover: 4, running: 2, ended: 1, settled: 1, done: 2 },
      { name: "Trần Thị B", total: 12, waiting: 1, budgeting: 2, handover: 2, running: 3, ended: 2, settled: 1, done: 1 },
      { name: "Lê Quốc C", total: 10, waiting: 0, budgeting: 2, handover: 1, running: 2, ended: 2, settled: 2, done: 1 },
    ],
    paymentByOperator: [
      { name: "Nguyễn Văn A", unpaid: 5, deposited: 3, full: 7 },
      { name: "Trần Thị B", unpaid: 3, deposited: 4, full: 9 },
      { name: "Lê Quốc C", unpaid: 2, deposited: 2, full: 6 },
    ],
    bookingByOperator: [
      { name: "Nguyễn Văn A", confirmed: 12, pending: 3 },
      { name: "Trần Thị B", confirmed: 8, pending: 4 },
      { name: "Lê Quốc C", confirmed: 9, pending: 2 },
    ],
    approvalQueue: [
      {
        id: "APR-001",
        type: "SETTLEMENT",
        tourCode: "TN-HCM-24031",
        owner: "Nguyễn Văn A",
        amount: 4800000,
        threshold: 3000000,
        submittedAt: "24/03/2026 09:14",
      },
      {
        id: "APR-002",
        type: "COST_EXCEPTION",
        tourCode: "QT-HN-24012",
        owner: "Trần Thị B",
        amount: 12000000,
        threshold: 5000000,
        submittedAt: "24/03/2026 10:26",
      },
    ],
  };
}
