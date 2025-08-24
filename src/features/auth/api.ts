// src/features/auth/api.ts
import api from "../../lib/api";

// ---------- Tipos ----------
export type LoginInput = {
  identifier: string; // username o email
  password: string;
};

export type RegisterInput = {
  username: string;         // requerido
  email: string;            // requerido en FRONT/API (aunque DB lo tenga opcional)
  password: string;         // requerido
  nombres?: string | null;  // opcional
  apellidos?: string | null;// opcional
};

export type ResetPasswordInput = {
  accessToken: string; // token de Supabase en la URL (?access_token=xxx)
  password: string;
};

export async function login(payload: LoginInput) {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
}

export async function register(payload: RegisterInput) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function forgotPassword(email: string, redirectTo?: string) {
  const body = redirectTo ? { email, redirectTo } : { email };
  const { status } = await api.post("/api/auth/forgot-password", body);
  return status === 204;
}

export async function resetPassword(payload: ResetPasswordInput) {
  const { data } = await api.post("/api/auth/reset-password", payload);
  return data;
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data as { usuarioId: string; email: string | null; username: string; nombre?: string };
}

export async function logout() {
  await api.post("/api/auth/logout");
}
