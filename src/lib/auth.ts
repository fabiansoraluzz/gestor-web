// src/lib/auth.ts
export type Session = {
  accessToken: string;
  tokenType?: string;   // "bearer"
  expiresIn?: number;   // en segundos (tiempo restante cuando se lee la sesión)
  usuarioId?: string;
  email?: string;
};

// Claves unificadas (las usamos en ambos storages)
const TOKEN_KEY   = "accessToken";
const EXP_KEY     = "accessToken_exp";   // epoch-ms
const SESSION_KEY = "session_meta";      // email/usuarioId/tokenType

// Helpers mínimos de storage
const S = {
  set(ls: Storage, key: string, val: string) { ls.setItem(key, val); },
  get(ls: Storage, key: string) { return ls.getItem(key); },
  del(ls: Storage, key: string) { ls.removeItem(key); },
};

function setIn(storage: Storage, s: Session) {
  S.set(storage, TOKEN_KEY, s.accessToken);
  if (s.expiresIn) {
    const expMs = Date.now() + s.expiresIn * 1000;
    S.set(storage, EXP_KEY, String(expMs));
  } else {
    S.del(storage, EXP_KEY);
  }
  const meta = {
    email: s.email ?? null,
    usuarioId: s.usuarioId ?? null,
    tokenType: s.tokenType ?? "bearer",
  };
  S.set(storage, SESSION_KEY, JSON.stringify(meta));
}

/**
 * Guarda la sesión según "remember":
 *  - remember=true  -> localStorage (persistente)
 *  - remember=false -> sessionStorage (por pestaña)
 */
export function saveSession(s: Session, remember: boolean) {
  // Limpia ambos para evitar estados mixtos
  clearSession();
  if (remember) {
    setIn(localStorage, s);
  } else {
    setIn(sessionStorage, s);
  }
}

/** Lee token: prioriza sessionStorage; si no, localStorage */
export function getToken(): string | null {
  return (
    S.get(sessionStorage, TOKEN_KEY) ??
    S.get(localStorage, TOKEN_KEY)
  );
}

export function clearSession() {
  [localStorage, sessionStorage].forEach((st) => {
    S.del(st, TOKEN_KEY);
    S.del(st, EXP_KEY);
    S.del(st, SESSION_KEY);
  });
}

export function isLoggedIn(): boolean {
  const t = getToken();
  if (!t) return false;

  // buscar expiración en el storage que tenga token
  const expStr =
    (S.get(sessionStorage, TOKEN_KEY) ? S.get(sessionStorage, EXP_KEY) : null) ??
    (S.get(localStorage, TOKEN_KEY) ? S.get(localStorage, EXP_KEY) : null) ??
    "0";

  const exp = Number(expStr || "0");
  return !exp || Date.now() < exp;
}

/** Devuelve sesión combinada (lee del storage que tenga token) */
export function getSession(): Session | null {
  const token = getToken();
  if (!token) return null;

  const preferSession = !!S.get(sessionStorage, TOKEN_KEY);
  const st = preferSession ? sessionStorage : localStorage;

  const expMs = Number(S.get(st, EXP_KEY) || "0");
  const secondsLeft =
    expMs && expMs > Date.now() ? Math.floor((expMs - Date.now()) / 1000) : undefined;

  let meta: Partial<Session> = {};
  try {
    const raw = S.get(st, SESSION_KEY);
    if (raw) meta = JSON.parse(raw);
  } catch {}

  return {
    accessToken: token,
    tokenType: meta.tokenType ?? "bearer",
    expiresIn: secondsLeft,
    usuarioId: meta.usuarioId,
    email: meta.email,
  };
}
