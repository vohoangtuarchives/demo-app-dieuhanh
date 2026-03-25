import { TOUR_STATUSES, type Role } from "@/lib/app-data";

export type TourStatus = (typeof TOUR_STATUSES)[number];
export type WorkflowAction = {
  from: TourStatus;
  to: TourStatus;
  actor: string;
  at: string;
  note?: string;
};
export type TransitionContext = {
  hasEstimate?: boolean;
  hasFinalGuestList?: boolean;
  handoverFileCount?: number;
  checklistConfirmed?: boolean;
  settlementApproved?: boolean;
  refundCompleted?: boolean;
};

const transitionMap: Record<TourStatus, TourStatus[]> = {
  "Chờ nhận": ["Đã nhận"],
  "Đã nhận": ["Đang dự toán"],
  "Đang dự toán": ["Bàn giao HDV"],
  "Bàn giao HDV": ["HDV nhận"],
  "HDV nhận": ["Đang diễn ra"],
  "Đang diễn ra": ["Kết thúc"],
  "Kết thúc": ["Đã quyết toán"],
  "Đã quyết toán": ["Chưa hoàn tiền"],
  "Chưa hoàn tiền": ["Thành công"],
  "Thành công": [],
};

export function canTransition(current: TourStatus, target: TourStatus, role: Role) {
  if (role !== "OPS" && target !== "Thành công") return false;
  return transitionMap[current].includes(target);
}

export function getNextStatuses(current: TourStatus, role: Role) {
  return TOUR_STATUSES.filter((status) => canTransition(current, status, role));
}

export function validateTransitionRequirements(current: TourStatus, context: TransitionContext) {
  if (current === "Đang dự toán") {
    const missing: string[] = [];
    if (!context.hasEstimate) missing.push("Thiếu bảng dự toán đã chốt");
    if (!context.hasFinalGuestList) missing.push("Thiếu danh sách khách hàng cuối cùng");
    return {
      valid: missing.length === 0,
      missing,
    };
  }
  if (current === "Bàn giao HDV") {
    const missing: string[] = [];
    if ((context.handoverFileCount ?? 0) < 9) missing.push("Chưa đủ 9 file bàn giao HDV");
    if (!context.checklistConfirmed) missing.push("Chưa có xác nhận checklist trước khởi hành");
    return {
      valid: missing.length === 0,
      missing,
    };
  }
  if (current === "Đã quyết toán" && !context.settlementApproved) {
    return { valid: false, missing: ["Chưa duyệt quyết toán"] };
  }
  if (current === "Chưa hoàn tiền" && !context.refundCompleted) {
    return { valid: false, missing: ["Chưa hoàn/thu tiền HDV"] };
  }
  return { valid: true, missing: [] as string[] };
}
