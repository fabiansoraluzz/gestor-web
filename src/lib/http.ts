// src/lib/http.ts
export type ApiEnvelope<T = unknown> = {
  status: "success" | "error";
  code: string;
  message: string;
  data: T[];
};

export class ApiError extends Error {
  code: string;
  http?: number;
  payload?: unknown;
  constructor(code: string, message: string, http?: number, payload?: unknown) {
    super(message);
    this.code = code;
    this.http = http;
    this.payload = payload;
  }
}

/** Valida el sobre del backend. Lanza ApiError si status !== 'success'. */
export function assertOk<T>(env: ApiEnvelope<T>, httpStatus?: number): T[] {
  if (!env || env.status !== "success") {
    throw new ApiError(env?.code ?? "UNKNOWN", env?.message ?? "Error desconocido", httpStatus, env?.data);
  }
  return Array.isArray(env.data) ? env.data : [];
}

/** Conveniencia: devuelve el primer elemento del data[] o undefined. */
export function first<T>(arr: T[]): T | undefined {
  return Array.isArray(arr) ? arr[0] : undefined;
}
