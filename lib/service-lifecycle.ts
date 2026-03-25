export type PaymentLifecycle = "UNPAID" | "DEPOSITED" | "PARTIAL_PAID" | "PAID_FULL";
export type BookingLifecycle = "DRAFT" | "SENT" | "PARTIAL_CONFIRMED" | "CONFIRMED" | "CANCELLED";
export type SettlementLifecycle = "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID_OUT";

export function derivePaymentLifecycle(paid: number, total: number): PaymentLifecycle {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID_FULL";
  if (paid <= total * 0.4) return "DEPOSITED";
  return "PARTIAL_PAID";
}

export function paymentLifecycleLabel(status: PaymentLifecycle) {
  if (status === "UNPAID") return "Chưa thanh toán";
  if (status === "DEPOSITED") return "Đã cọc";
  if (status === "PARTIAL_PAID") return "Thanh toán một phần";
  return "Đã thanh toán đủ";
}

export function paymentLifecycleVariant(status: PaymentLifecycle): "danger" | "warning" | "info" | "success" {
  if (status === "UNPAID") return "danger";
  if (status === "DEPOSITED") return "warning";
  if (status === "PARTIAL_PAID") return "info";
  return "success";
}
