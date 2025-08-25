// src/features/auth/api.ts
import api from "../../lib/api";
import type { ApiEnvelope } from "../../lib/http";
import { assertOk, first } from "../../lib/http";

// ---------- Tipos ----------
export type LoginInput =
  | { email: string; password: string; remember?: boolean }
  | { username: string; password: string; remember?: boolean };

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  nombres?: string | null;
  apellidos?: string | null;
};

export type ResetPasswordInput = {
  accessToken: string;
  refreshToken: string; // Importante en Supabase v2
  password: string;
};

export type SessionPayload = {
  usuarioId: string;
  email: string | null;
  usuario?: string;
  nombre?: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  tokenType: string | null;
  remember?: boolean;
};

export type Perfil = {
  id: string;
  auth_usuario_id: string;
  usuario: string;
  correo: string;
  nombres: string | null;
  apellidos: string | null;
  avatar_url: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  roles: string[];
};

// ---------- Wrappers ----------
export async function iniciarSesion(payload: LoginInput) {
  const { data, status } = await api.post<ApiEnvelope<SessionPayload>>(
    "/api/auth/iniciarSesion",
    payload
  );
  const arr = assertOk(data, status);
  return first(arr)!; // payload de sesión
}

export async function registrarUsuario(payload: RegisterInput) {
  const { data, status } = await api.post<ApiEnvelope<SessionPayload>>(
    "/api/auth/registrarUsuario",
    payload
  );
  const arr = assertOk(data, status);
  return first(arr)!;
}

export async function olvideContrasena(email: string, redirectTo?: string) {
  const body = redirectTo ? { email, redirectTo } : { email };
  const { data, status } = await api.post<ApiEnvelope<unknown>>(
    "/api/auth/olvideContrasena",
    body
  );
  assertOk(data, status);
  return true;
}

export async function restablecerContrasena(payload: ResetPasswordInput) {
  const { data, status } = await api.post<ApiEnvelope<{ userId: string }>>(
    "/api/auth/restablecerContrasena",
    payload
  );
  const arr = assertOk(data, status);
  return first(arr)!; // { userId }
}

export async function me() {
  const { data, status } = await api.get<ApiEnvelope<Perfil>>("/api/auth/me");
  const arr = assertOk(data, status);
  return first(arr)!; // Perfil
}

export async function cerrarSesion() {
  const { data, status } = await api.post<ApiEnvelope<unknown>>("/api/auth/cerrarSesion");
  assertOk(data, status);
  return true;
}
