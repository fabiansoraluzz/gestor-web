// src/lib/api.ts
import axios, { AxiosHeaders } from "axios";
import { getToken, clearSession } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// (Opcional) bypass de Vercel para preview
const BYPASS = import.meta.env.VITE_VERCEL_BYPASS as string | undefined;
if (BYPASS) {
  api.defaults.headers.common["x-vercel-protection-bypass"] = BYPASS;
}

// 👉 Interceptor de request: agrega Authorization si hay token
api.interceptors.request.use((cfg) => {
  const headers = new AxiosHeaders(cfg.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (BYPASS) headers.set("x-vercel-protection-bypass", BYPASS);
  cfg.headers = headers;
  return cfg;
});

// (Opcional) Interceptor de response: si 401, limpiar sesión
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      clearSession();
      // Aquí podrías redirigir al login si usas router
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
