// src/app/RequireAuth.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

type Props = { children: ReactNode };

export default function RequireAuth({ children }: Props) {
  const loc = useLocation();

  if (!isLoggedIn()) {
    const redirect = encodeURIComponent(loc.pathname + loc.search + loc.hash);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
