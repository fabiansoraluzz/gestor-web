// src/app/components/ProductoNuevoModal.tsx
import * as React from "react";
import Select from "./ui/Select";

type Opcion = { id: number; nombre: string; clave?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  categorias?: Opcion[];
  unidades?: Opcion[];
};

export default function ProductoNuevoModal({
  open,
  onClose,
  categorias = [{ id: 1, nombre: "Arandela" }],
  unidades = [
    { id: 1, nombre: "kg", clave: "KILO" },
    { id: 2, nombre: "dz", clave: "DOCENA" },
  ],
}: Props) {
  const [intCategoriaId, setCategoria] = React.useState<number | "">("");
  const [intUnidadId, setUnidad] = React.useState<number | "">("");
  const [strVariante, setVariante] = React.useState("");
  const [strMedida, setMedida] = React.useState("");
  const [strColor, setColor] = React.useState("");
  const [strNotas, setNotas] = React.useState("");
  const [decCantidad, setCantidad] = React.useState<string>(""); // ← NUEVO

  // unidad corta (kg/dz) para mostrar en el sufijo de Cantidad
  const unidadCorta = React.useMemo(() => {
    const u = unidades.find((x) => x.id === intUnidadId)?.nombre?.toLowerCase() ?? "";
    return u; // 'kg' | 'dz' | ''
  }, [intUnidadId, unidades]);

  const nombreAuto = React.useMemo(() => {
    const cat = categorias.find((c) => c.id === intCategoriaId)?.nombre ?? "";
    const partes = [cat, strVariante, strMedida, strColor].map((p) => (p || "").trim());
    return partes.filter(Boolean).join(" ").replace(/\s+/g, " ");
  }, [intCategoriaId, strVariante, strMedida, strColor, categorias]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200">
          {/* Header */}
          <div className="px-6 pt-6">
            <h3 className="text-[22px] font-semibold text-slate-900">Nuevo producto</h3>

            {/* Zona de imagen + texto */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 grid place-items-center text-slate-400 text-sm">
                Imagen
              </div>

              <div className="flex flex-col items-center text-slate-600 text-sm">
                <div className="leading-5 text-center">Arrastra una imagen aquí</div>
                <div className="text-slate-400 my-0.5">o</div>
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Buscar imagen
                </button>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-6 pb-6 mt-4">
            {/* Responsive: 80px 1fr (sm) ; 135px 1fr (md+) */}
            <div className="grid grid-cols-[80px_1fr] md:grid-cols-[135px_1fr] gap-x-4 gap-y-3 items-start">
              {/* Nombre (autogenerado) */}
              <label className="text-slate-700 text-sm">Nombre</label>
              <input
                value={nombreAuto}
                readOnly
                placeholder="Se generará según categoría, variante, medida y color"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none"
              />

              {/* Categoría */}
              <label className="text-slate-700 text-sm">Categoría</label>
              <Select
                value={intCategoriaId}
                onChange={(v) => setCategoria(v as number | "")}
                placeholder="Selecciona una categoría"
                options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
              />

              {/* Unidad */}
              <label className="text-slate-700 text-sm">Unidad</label>
              <Select
                value={intUnidadId}
                onChange={(v) => setUnidad(v as number | "")}
                placeholder="Selecciona la unidad"
                options={unidades.map((u) => ({ value: u.id, label: u.nombre }))}
              />

              {/* Cantidad (NUEVO) */}
              <label className="text-slate-700 text-sm">Cantidad</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.001"
                  value={decCantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej.: 12"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-3 pr-12 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                {/* sufijo de unidad */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 uppercase">
                  {unidadCorta || "—"}
                </span>
              </div>

              {/* Variante */}
              <label className="text-slate-700 text-sm">Variante</label>
              <input
                value={strVariante}
                onChange={(e) => setVariante(e.target.value)}
                placeholder='Ej.: "Plana", "Cónica"'
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              {/* Medida */}
              <label className="text-slate-700 text-sm">Medida</label>
              <input
                value={strMedida}
                onChange={(e) => setMedida(e.target.value)}
                placeholder='Ej.: 5/8, 1/8", 4 1/2"'
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              {/* Color */}
              <label className="text-slate-700 text-sm">Color / acabado</label>
              <input
                value={strColor}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej.: Zincado"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              {/* Notas */}
              <label className="text-slate-700 text-sm self-start">Notas</label>
              <textarea
                value={strNotas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Observaciones (opcional)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2.5 text-sm hover:bg-slate-50"
              >
                Descartar
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 shadow-sm"
              >
                Añadir producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
