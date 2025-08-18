import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Boxes, LineChart, PlusSquare, Bell, Users,
  Settings2, Cog, CircleHelp, LogOut, Package2
} from "lucide-react";
import { cn } from "../../lib/ui";
import { clearSession, getSession } from "../../lib/auth"; // ya lo tienes

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventario", label: "Inventario", icon: Boxes },
  { to: "/ventas", label: "Ventas", icon: LineChart },
  { to: "/crear-producto", label: "Crear Producto", icon: PlusSquare },
  { to: "/notificaciones", label: "Notificaciones", icon: Bell, badge: true },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/admin", label: "Administración", icon: Settings2 },
  { to: "/configuracion", label: "Configuración", icon: Cog },
  { to: "/ayuda", label: "Ayuda", icon: CircleHelp },
];

export default function Sidebar() {
  const nav = useNavigate();
  const ses = getSession();

  function logout() {
    clearSession();
    nav("/auth/login");
  }

  return (
    <aside className="h-screen sticky top-0 border-r bg-white w-64 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b">
        <div className="grid place-items-center h-9 w-9 rounded-xl bg-blue-600">
          <Package2 className="size-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold">GESTOR</p>
          <p className="text-xs text-slate-500">Panel</p>
        </div>
      </div>

      {/* Menú */}
      <nav className="p-3 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                "text-slate-600 hover:bg-slate-100",
                isActive && "bg-blue-50 text-blue-700 font-medium"
              )
            }
          >
            <Icon className="size-4" />
            <span>{label}</span>
            {badge && (
              <span className="absolute right-3 top-1.5 inline-block size-2 rounded-full bg-red-500" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Pie: usuario + salir */}
      <div className="mt-auto p-3 border-t">
        <div className="px-3 pb-2 text-xs text-slate-500 truncate">
          {ses?.email ?? "usuario@correo.com"}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
        >
          <LogOut className="size-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
