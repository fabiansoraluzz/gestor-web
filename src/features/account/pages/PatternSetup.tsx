import { useState } from "react";
import PatternPad from "../../../app/components/PatternPad";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { setPattern } from "../../auth/api";

function serializePattern(points: number[]) { return points.join("-"); }

export default function PatternSetup() {
  const [pts, setPts] = useState<number[]>([]);

  const mut = useMutation({
    mutationFn: (pattern: string) => setPattern({ pattern }),
    onMutate: () => toast.loading("Guardando patrón...", { id: "pat" }),
    onSuccess: () => toast.success("Patrón actualizado", { id: "pat" }),
    onError: (e: any) => toast.error(e?.response?.data?.error ?? "No se pudo guardar", { id: "pat" }),
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-6">Configurar Patrón</h1>

        <div className="flex flex-col items-center gap-3">
          <PatternPad size={280} path={pts} onChange={setPts} onFinish={(arr) => setPts(arr)} />
        </div>

        <button
          className="mt-6 w-full rounded bg-indigo-600 text-white py-2 hover:bg-indigo-700 disabled:opacity-60"
          disabled={pts.length < 3 || mut.isPending}
          onClick={() => mut.mutate(serializePattern(pts))}
        >
          {mut.isPending ? "Guardando..." : "Guardar patrón"}
        </button>
      </div>
    </div>
  );
}
