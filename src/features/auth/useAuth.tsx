// src/features/auth/useAuth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cerrarSesion, me, rehidratarSesion } from "./api";
import {
  clearSession,
  getToken,
  saveSession,
  type Session,
} from "../../lib/auth";

type User = { id: string; email: string | null; nombre?: string } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  setToken: (t: string | null) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

/** ===== Preferencia "recordar sesión" (persistida) ===== */
const REMEMBER_KEY = "rememberPreferred";
function getRememberPreferred(): boolean {
  try {
    const v = localStorage.getItem(REMEMBER_KEY);
    return v === "1";
  } catch {
    return false;
  }
}
function setRememberPreferred(v: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Expuesto para que Login.tsx marque la preferencia al éxito */
export const __authInternals = {
  setRememberFlag: (v: boolean) => setRememberPreferred(v),
  setHasSession: (_v: boolean) => void 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1) estado de token inicial (lo obtiene de lib/auth, que ya busca en ambos storages)
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User>(null);

  /** Setter centralizado del token (sin tocar expiración/meta aquí) */
  const setToken = (t: string | null) => {
    setTokenState(t);
    if (!t) {
      clearSession();
    }
  };

  /** 2) Rehidratación (solo una vez) si el usuario prefirió recordar */
  const triedRehydrate = useRef(false);
  useEffect(() => {
    if (triedRehydrate.current) return;
    triedRehydrate.current = true;

    const currentToken = getToken();
    if (currentToken) {
      setTokenState(currentToken);
      return;
    }

    const onAuthRoute = /^\/auth\//.test(window.location.pathname);
    const preferRemember = getRememberPreferred();
    if (!preferRemember || onAuthRoute) return;

    // Intento de rehidratación por cookie HttpOnly (solo si rememberPreferred=true)
    rehidratarSesion()
      .then((session) => {
        if (session?.accessToken) {
          const s: Session = {
            accessToken: session.accessToken,
            tokenType: session.tokenType ?? undefined,
            expiresIn: session.expiresIn ?? undefined,
            usuarioId: session.usuarioId ?? undefined,
            email: session.email ?? undefined,
          };
          // <- remember true porque proviene de cookie persistente
          saveSession(s, true);
          setTokenState(session.accessToken);
        }
      })
      .catch(() => {
        /* sin cookie válida, seguimos sin sesión */
      });
  }, []);

  /** 3) Cuando hay token, traer el perfil (evita doble llamada) */
  const fetchedForToken = useRef<string | null>(null);
  useEffect(() => {
    if (!token) {
      setUser(null);
      fetchedForToken.current = null;
      return;
    }
    if (fetchedForToken.current === token) return;
    fetchedForToken.current = token;

    me()
      .then((perfil) => {
        setUser({
          id: perfil.id,
          email: perfil.correo,
          nombre:
            (perfil.nombres ? `${perfil.nombres} ${perfil.apellidos ?? ""}`.trim() : undefined) ||
            perfil.usuario ||
            perfil.correo?.split?.("@")?.[0] ||
            undefined,
        });
      })
      .catch(() => {
        clearSession();
        setTokenState(null);
        setUser(null);
      });
  }, [token]);

  /** 4) Cerrar sesión (API + limpiar storages) */
  const signOut = async () => {
    try {
      await cerrarSesion();
    } finally {
      clearSession();
      setTokenState(null);
      setUser(null);
      setRememberPreferred(false);
    }
  };

  const value = useMemo<AuthCtx>(
    () => ({ user, token, setToken, signOut }),
    [user, token]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
