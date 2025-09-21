// src/features/inventory/pages/Inventario.tsx
import React from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import ProductoNuevoModal from "../../../app/components/ProductoNuevoModal";

/** ---- Helpers UI ---- */
function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "slate";
}) {
  const tones: Record<typeof tone, string> = {
    green:
      "text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200/70",
    red: "text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-200/70",
    slate:
      "text-slate-700 bg-slate-100 ring-1 ring-inset ring-slate-200/70",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function formatPEN(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Card de resumen (mismo estilo que “Stock bajo”) */
function ResumenCard({
  titulo,
  tituloClass,
  leftValue,
  leftLabel,
  rightValue,
  rightLabel,
}: {
  titulo: string;
  tituloClass: string;
  leftValue: string | number;
  leftLabel: string;
  rightValue?: string | number;
  rightLabel?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className={`text-sm font-semibold ${tituloClass}`}>{titulo}</div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {leftValue}
          </div>
          <div className="mt-1 text-slate-500 text-sm">{leftLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {rightValue ?? "—"}
          </div>
          <div className="mt-1 text-slate-500 text-sm">
            {rightLabel ?? ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---- Página ---- */
export default function Inventario() {
  const [openNuevo, setOpenNuevo] = React.useState(false);

  return (
    <div className="px-6 md:px-8 py-6">
      {/* Resumen de inventario */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-7">
        <h2 className="text-xl md:text-[22px] font-semibold text-slate-900">
          Resumen de inventario
        </h2>

        {/* 3 columnas (quitamos el card de Categorías) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ResumenCard
            titulo="Total de productos"
            tituloClass="text-amber-600"
            leftValue={868}
            leftLabel="Totales"
            rightValue={formatPEN(25000)} // S/ 25,000
            rightLabel="Ingresos"
          />
          <ResumenCard
            titulo="Más movidos"
            tituloClass="text-purple-600"
            leftValue={5}
            leftLabel="Productos"
            rightValue={formatPEN(2500)} // S/ 2,500
            rightLabel="Costo"
          />
          <ResumenCard
            titulo="Stock bajo"
            tituloClass="text-rose-600"
            leftValue={12}
            leftLabel="Bajo stock"
            rightValue={2}
            rightLabel="Sin stock"
          />
        </div>
      </div>

      {/* Tarjeta tabla de productos */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Productos</h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenNuevo(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-medium px-3.5 py-2.5 hover:bg-blue-700 shadow-sm"
            >
              Añadir producto
            </button>

            <ProductoNuevoModal
              open={openNuevo}
              onClose={() => setOpenNuevo(false)}
              // categorias y unidades reales se inyectarán con la API
            />
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-center">
            {/* Búsqueda */}
            <div className="lg:col-span-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Buscar por nombre"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtros (derecha) */}
            <div className="lg:col-span-2 flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Categoría:</span>
                <button className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Todas
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Estado:</span>
                <button className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Todos
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Botón Filtros (AZUL, SIN BORDES) */}
              <button
                type="button"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
              >
                <FunnelIcon className="w-5 h-5" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla (maquetado) */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            {/* Anchos homogéneos por columna para distancias uniformes */}
            <colgroup>
              <col className="w-[28rem]" />
              <col className="w-36" />
              <col className="w-36" />
              <col className="w-36" />
              <col className="w-36" />
              <col className="w-36" />
              <col className="w-40" />
            </colgroup>

            <thead className="bg-slate-50 text-slate-600">
              <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-left [&>th]:font-semibold">
                <th>Producto</th>
                <th>Categoría</th>
                <th>Medida</th>
                <th>Color</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {[
                {
                  intProductoId: 1,
                  strSKU: "AR-PL-KG-0001",
                  strNombre: "Arandela Plana 5/8 Zincado",
                  strCategoria: "Arandela",
                  strUnidad: "kg",
                  strMedida: "5/8",
                  strColor: "Zincado",
                  numStockActual: 0,
                  boolActivo: true,
                },
                {
                  intProductoId: 2,
                  strSKU: "AR-PL-DOC-0002",
                  strNombre: 'Arandela Plana 1/8" Zincado',
                  strCategoria: "Arandela",
                  strUnidad: "dz",
                  strMedida: '1/8"',
                  strColor: "Zincado",
                  numStockActual: 12,
                  boolActivo: true,
                },
              ].map((p) => {
                const sinStock = Number(p.numStockActual) <= 0;
                return (
                  <tr key={p.intProductoId} className="[&>td]:px-6 [&>td]:py-4">
                    {/* Producto: nombre + SKU en pequeño */}
                    <td>
                      <div className="font-medium text-slate-900">{p.strNombre}</div>
                      <div className="text-xs text-slate-500 mt-0.5">SKU: {p.strSKU}</div>
                    </td>

                    {/* Categoría */}
                    <td className="truncate">{p.strCategoria}</td>

                    {/* Medida */}
                    <td>{p.strMedida}</td>

                    {/* Color */}
                    <td className="truncate">{p.strColor ?? "—"}</td>

                    {/* Stock */}
                    <td className="font-medium">
                      {p.numStockActual}{" "}
                      <span className="uppercase text-slate-500">{p.strUnidad}</span>
                    </td>

                    {/* Estado */}
                    <td>
                      {sinStock ? (
                        <Badge>Sin stock</Badge>
                      ) : (
                        <Badge tone="green">En stock</Badge>
                      )}
                    </td>

                    {/* Acciones (alineado a la izquierda) */}
                    <td className="text-left">
                      <div className="inline-flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 hover:text-slate-700 cursor-pointer" />
                        <PencilSquareIcon className="w-5 h-5 hover:text-slate-700 cursor-pointer" />
                        <TrashIcon className="w-5 h-5 hover:text-rose-600 cursor-pointer" />
                        <EllipsisVerticalIcon className="w-5 h-5 hover:text-slate-700 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pie / paginación (mock) */}
        <div className="px-6 py-4 flex items-center justify-between text-sm text-slate-600">
          <div>Mostrando 1–5 de 250 productos</div>

          <div className="flex items-center gap-1">
            <button className="h-8 w-8 grid place-items-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
              ‹
            </button>
            <button className="h-8 px-3 rounded-md bg-blue-600 text-white font-medium">1</button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
              2
            </button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
              3
            </button>
            <span className="px-2">…</span>
            <button className="h-8 w-12 grid place-items-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
              50
            </button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
