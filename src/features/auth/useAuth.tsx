import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { me } from './api'; // <-- de tu paso 5/6

type User = { id: string; email: string } | null;
type AuthCtx = {
  user: User;
  token: string | null;
  setToken: (t: string | null) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (!token) return setUser(null);
    me()
      .then((u) => setUser({ id: u.usuarioId, email: u.email }))
      .catch(() => setUser(null));
  }, [token]);

  const value = useMemo<AuthCtx>(
    () => ({ user, token, setToken, signOut: () => setToken(null) }),
    [user, token]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
