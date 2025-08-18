// src/lib/auth.ts
export type Session = {
  accessToken: string;
  tokenType?: string;   // "bearer"
  expiresIn?: number;   // en segundos (tiempo restante cuando se lee la sesión)
  usuarioId?: string;
  email?: string;
};

const TOKEN_KEY   = "accessToken";
const EXP_KEY     = "accessToken_exp";   // almacena epoch-ms de expiración
const SESSION_KEY = "session_meta";      // almacena email/usuarioId/tokenType

export function saveSession(s: Session) {
  // token y expiración
  localStorage.setItem(TOKEN_KEY, s.accessToken);
  if (s.expiresIn) {
    const expMs = Date.now() + s.expiresIn * 1000;
    localStorage.setItem(EXP_KEY, String(expMs));
  } else {
    localStorage.removeItem(EXP_KEY);
  }

  // metadatos (email, usuarioId, tokenType)
  const meta = {
    email: s.email ?? null,
    usuarioId: s.usuarioId ?? null,
    tokenType: s.tokenType ?? "bearer",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(meta));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  const t = getToken();
  if (!t) return false;
  const exp = Number(localStorage.getItem(EXP_KEY) || "0");
  return !exp || Date.now() < exp;
}

/**
 * Devuelve toda la sesión combinando token + metadatos.
 * Si no hay token, retorna null.
 */
export function getSession(): Session | null {
  const accessToken = getToken();
  if (!accessToken) return null;

  // segundos restantes (si tenemos EXP_KEY)
  const expMs = Number(localStorage.getItem(EXP_KEY) || "0");
  const secondsLeft =
    expMs && expMs > Date.now() ? Math.floor((expMs - Date.now()) / 1000) : undefined;

  let meta: Partial<Session> = {};
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) meta = JSON.parse(raw);
  } catch {
    // ignore
  }

  return {
    accessToken,
    tokenType: meta.tokenType ?? "bearer",
    expiresIn: secondsLeft,
    usuarioId: meta.usuarioId,
    email: meta.email,
  };
}
