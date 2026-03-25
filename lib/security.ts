import type { Role } from "./app-data";

export function maskMoneyByRole(value: number, role: Role) {
  if (role === "MANAGER") return value.toLocaleString("vi-VN");
  const str = value.toLocaleString("vi-VN");
  return `${str.slice(0, 3)}***`;
}
