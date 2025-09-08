// src/app/components/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,   // Dashboard
  UsersIcon,         // Clientes
  BellIcon,          // Notificaciones
  Cog6ToothIcon,     // Configuración
  CubeIcon,          // Productos
  ArrowRightOnRectangleIcon, // Salir
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/ui";
import { clearSession, getSession } from "../../lib/auth";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Squares2X2Icon },
  { to: "/inventario", label: "Inventario", icon: CubeIcon },
  { to: "/clients", label: "Clientes", icon: UsersIcon },
  { to: "/notifications", label: "Notificaciones", icon: BellIcon },
  { to: "/settings", label: "Configuración", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  return (
    <aside className="h-screen w-64 border-r bg-white/60 backdrop-blur-sm">
      <div className="p-4 border-b">
        <div className="font-semibold text-slate-800">Gestor</div>
        <div className="text-xs text-slate-500 truncate">
          {session?.email ?? "—"}
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <button
          onClick={() => {
            clearSession();
            navigate("/auth/login");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
