import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getSession } from "../../lib/auth";

export default function AppLayout() {
  const ses = getSession();

  return (
    <div className="min-h-screen grid grid-cols-[256px_1fr] bg-slate-50">
      <Sidebar />

      <div className="min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-end px-6">
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">{ses?.email ?? "Usuario"}</p>
              <p className="text-xs text-slate-500">Plan Gratuito</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* Contenido */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
