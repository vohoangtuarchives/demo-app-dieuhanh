import { getManagerDashboardMock, getOperatorDashboardMock } from "./mock";
import type { ManagerDashboardPayload, OperatorDashboardPayload } from "./contracts";

export async function getOperatorDashboard(): Promise<OperatorDashboardPayload> {
  return getOperatorDashboardMock();
}

export async function getManagerDashboard(): Promise<ManagerDashboardPayload> {
  return getManagerDashboardMock();
}
