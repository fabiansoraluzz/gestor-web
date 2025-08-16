import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import { useAuth } from '../features/auth/useAuth';

// Rutas protegidas (requieren token)
function Protected() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  // Arrancar el sitio siempre en /auth/login
  { path: '/', element: <Navigate to="/auth/login" replace /> },

  // Públicas
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/register', element: <Register /> },
  { path: '/auth/forgot', element: <ForgotPassword /> },

  // Privadas
  {
    element: <Protected />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
    ],
  },
]);
