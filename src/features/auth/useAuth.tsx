import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me as apiMe, logout as apiLogout } from "./api";
import { getToken, clearSession } from "../../lib/auth";

type User = { id: string; email: string; nombre?: string } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  setToken: (t: string | null) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // token inicial desde tu storage real (accessToken)
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User>(null);

  // Sincroniza almacenamiento cuando seteas token manualmente desde la app
  const setToken = (t: string | null) => {
    setTokenState(t);
    if (!t) {
      clearSession(); // borra accessToken, expiración y meta
    } else {
      // No sobreescribimos expiración ni meta aquí: eso ya lo hace saveSession en Login.tsx
      localStorage.setItem("accessToken", t);
    }
  };

  // Cuando el token cambie, intenta traer el usuario
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancel = false;
    apiMe()
      .then((u) => {
        if (cancel) return;
        setUser({ id: u.usuarioId, email: u.email, nombre: u.nombre });
      })
      .catch(() => {
        if (cancel) return;
        // token inválido → limpiar
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
      await apiLogout();
    } finally {
      clearSession();
      setTokenState(null);
      setUser(null);
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
