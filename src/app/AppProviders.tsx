// src/app/AppProviders.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "../features/auth/useAuth";
import React from "react";

const qc = new QueryClient();

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
