// src/features/auth/api.ts
import api from "../../lib/api";

// ---------- Tipos mínimos ----------
export type LoginPasswordInput = { email: string; password: string; recordarme?: boolean };
export type LoginPatternInput  = { email: string; pattern: string; recordarme?: boolean };

export type RegisterInput = {
  nombreCompleto: string;
  email: string;
  password: string;
  pattern?: string;
};

export type ResetPasswordInput = {
  accessToken: string;        // obtenido del querystring de Supabase (access_token)
  password: string;
  pattern?: string;
};

export type SetPatternInput = { pattern: string };

// ---------- Llamadas ----------
export async function loginPassword(payload: LoginPasswordInput) {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
}

export async function loginWithPattern(payload: LoginPatternInput) {
  const { data } = await api.post("/api/auth/pattern/login", payload);
  return data;
}

export async function register(payload: RegisterInput) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function forgotPassword(email: string, redirectTo?: string) {
  const body = redirectTo ? { email, redirectTo } : { email };
  const { status } = await api.post("/api/auth/forgot-password", body);
  // el backend devuelve 204
  return status === 204;
}

export async function resetPassword(payload: ResetPasswordInput) {
  const { data } = await api.post("/api/auth/reset-password", payload);
  return data;
}

export async function setPattern(payload: SetPatternInput) {
  await api.post("/api/auth/pattern/set", payload);
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data as { usuarioId: string; email: string; nombre?: string };
}

export async function logout() {
  await api.post("/api/auth/logout");
}