// src/app/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import RequireAuth from "./RequireAuth.tsx";

import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

import Dashboard from "../features/dashboard/pages/Dashboard";
import Inventario from "../features/inventory/pages/Inventario";
import Ventas from "../features/sales/pages/Ventas";
import CrearProducto from "../features/products/pages/CrearProducto";
import Notificaciones from "../features/notifications/pages/Notificaciones";
import Clientes from "../features/clients/pages/Clientes";
import Admin from "../features/admin/pages/Admin";
import Configuracion from "../features/settings/pages/Configuracion";
import Ayuda from "../features/help/pages/Ayuda";

export const router = createBrowserRouter([
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/register", element: <Register /> },
  { path: "/auth/forgot", element: <ForgotPassword /> },
  { path: "/auth/reset", element: <ResetPassword /> },

  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "inventario", element: <Inventario /> },
      { path: "ventas", element: <Ventas /> },
      { path: "crear-producto", element: <CrearProducto /> },
      { path: "notificaciones", element: <Notificaciones /> },
      { path: "clientes", element: <Clientes /> },
      { path: "admin", element: <Admin /> },
      { path: "configuracion", element: <Configuracion /> },
      { path: "ayuda", element: <Ayuda /> },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
