import type { ApiError } from "./contracts";

export function parseApiError(error: unknown, fallbackMessage = "Có lỗi hệ thống") {
  if (typeof error === "object" && error && "message" in error) {
    return (error as ApiError).message ?? fallbackMessage;
  }
  return fallbackMessage;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const fallback: ApiError = {
      code: "HTTP_ERROR",
      message: "Không thể tải dữ liệu",
    };
    throw fallback;
  }
  return (await response.json()) as T;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw { code: "HTTP_POST_ERROR", message: "Không thể gửi dữ liệu" } as ApiError;
  }
  return (await response.json()) as T;
}
