import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/useAuth';
import { Toaster } from "sonner";

const client = new QueryClient();

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster richColors closeButton position="top-center" />
    </QueryClientProvider>
  );
}
