// src/features/auth/useAuth.ts
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me as apiMe, cerrarSesion as apiCerrarSesion } from "./api";
import { getToken, clearSession } from "../../lib/auth";

type User = { id: string; email: string | null; nombre?: string } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  setToken: (t: string | null) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User>(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (!t) {
      clearSession();
    } else {
      localStorage.setItem("accessToken", t);
    }
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancel = false;
    apiMe()
      .then((perfil) => {
        if (cancel) return;
        const nombre = `${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim() || undefined;
        setUser({ id: perfil.id, email: perfil.correo, nombre });
      })
      .catch(() => {
        if (cancel) return;
        clearSession();
        setTokenState(null);
        setUser(null);
      });
    return () => {
      cancel = true;
    };
  }, [token]);

  const signOut = async () => {
    try {
      await apiCerrarSesion();
    } finally {
      clearSession();
      setTokenState(null);
      setUser(null);
    }
  };

  const value = useMemo<AuthCtx>(() => ({ user, token, setToken, signOut }), [user, token]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
