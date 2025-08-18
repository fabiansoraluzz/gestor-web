export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ventas Totales</p>
          <p className="mt-2 text-2xl font-bold">$12,450</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Productos</p>
          <p className="mt-2 text-2xl font-bold">1,250</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Clientes</p>
          <p className="mt-2 text-2xl font-bold">320</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500 mb-2">Rendimiento de Ventas</p>
        <div className="h-40 grid place-items-center text-slate-400">
          (gráfico aquí)
        </div>
      </div>
    </div>
  );
}
