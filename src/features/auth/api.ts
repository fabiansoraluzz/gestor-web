// src/features/auth/api.ts
import api from '../../lib/api';

export type LoginReq = { email: string; password: string; recordarme: boolean };
export type LoginRes = {
  usuarioId: string;
  email: string;
  nombre?: string;
  accessToken: string | null;
  expiresIn?: number;
  tokenType?: string;
  requiereConfirmacion?: boolean;
};

export const login = async (payload: LoginReq) => {
  const { data } = await api.post<LoginRes>('/api/auth/login', payload);
  return data;
};

export type RegisterReq = { nombreCompleto: string; email: string; password: string };
export const register = async (payload: RegisterReq) => {
  const { data } = await api.post('/api/auth/register', payload);
  return data; // { usuarioId, requiereConfirmacion, accessToken }
};

export const forgotPassword = async (email: string) => {
  await api.post('/api/auth/forgot-password', { email });
};

export type MeRes = { usuarioId: string; email: string };
export const me = async () => {
  const { data } = await api.get<MeRes>('/api/auth/me');
  return data;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};
