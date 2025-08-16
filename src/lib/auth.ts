// src/lib/auth.ts
export type Session = {
  accessToken: string;
  tokenType?: string;   // "bearer"
  expiresIn?: number;   // en segundos
  usuarioId?: string;
  email?: string;
};

const TOKEN_KEY = "accessToken";
const EXP_KEY   = "accessToken_exp"; // opcional

export function saveSession(s: Session) {
  localStorage.setItem(TOKEN_KEY, s.accessToken);
  if (s.expiresIn) {
    const expMs = Date.now() + s.expiresIn * 1000;
    localStorage.setItem(EXP_KEY, String(expMs));
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
}

export function isLoggedIn(): boolean {
  const t = getToken();
  if (!t) return false;
  const exp = Number(localStorage.getItem(EXP_KEY) || "0");
  return !exp || Date.now() < exp;
}
