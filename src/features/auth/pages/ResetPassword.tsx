import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPassword } from "../api";

const schema = z.object({
  password: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmar: z.string(),
  pattern: z.string().optional(),
}).refine(v => v.password === v.confirmar, { path: ["confirmar"], message: "Las contraseñas no coinciden" });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const nav = useNavigate();

  // Supabase suele mandar ?access_token=...&type=recovery
  const accessToken = sp.get("access_token") ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mut = useMutation({
    mutationFn: (v: FormData) => resetPassword({ accessToken, password: v.password, pattern: v.pattern }),
    onMutate: () => toast.loading("Actualizando contraseña...", { id: "reset" }),
    onSuccess: () => {
      toast.success("Contraseña actualizada. ¡Ya puedes iniciar sesión!", { id: "reset" });
      nav("/auth/login");
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? "No se pudo actualizar", { id: "reset" }),
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form
        onSubmit={handleSubmit((v) => mut.mutate(v))}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow"
      >
        <h1 className="text-2xl font-semibold mb-6">Crea tu nuevo acceso</h1>

        {!accessToken && (
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-4">
            Falta el <code>access_token</code> en la URL.
          </p>
        )}

        <label className="block text-sm mb-1">Nueva contraseña</label>
        <input type="password" {...register("password")} className="w-full border rounded px-3 py-2 mb-1" />
        {errors.password && <p className="text-red-600 text-sm mb-3">{errors.password.message}</p>}

        <label className="block text-sm mb-1 mt-2">Confirmar contraseña</label>
        <input type="password" {...register("confirmar")} className="w-full border rounded px-3 py-2 mb-1" />
        {errors.confirmar && <p className="text-red-600 text-sm mb-3">{errors.confirmar.message}</p>}

        {/* opcional: permitir setear patrón aquí */}
        <label className="block text-sm mb-1 mt-2">Patrón (opcional, ej. 0-1-2-3-5)</label>
        <input {...register("pattern")} className="w-full border rounded px-3 py-2 mb-1" placeholder="0-1-2-3-5" />

        <button
          type="submit"
          disabled={mut.isPending || !accessToken}
          className="mt-4 w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {mut.isPending ? "Guardando..." : "Guardar"}
        </button>

        <div className="text-sm mt-4">
          <Link to="/auth/login" className="text-blue-600 hover:underline">Volver a iniciar sesión</Link>
        </div>
      </form>
    </div>
  );
}
