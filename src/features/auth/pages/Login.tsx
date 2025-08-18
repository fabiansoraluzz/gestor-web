import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PatternPad from "../../../app/components/PatternPad";
import { toast } from "sonner";

import { saveSession } from "../../../lib/auth";
import { useAuth } from "../useAuth";
import { loginPassword, loginWithPattern } from "../api";

// --------- Schemas ---------
const passwordSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  recordarme: z.boolean().default(true),
});

const patternSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
  pattern: z.string().min(3, "Dibuja un patrón válido."),
  recordarme: z.boolean().default(true),
});

// Tipos de INPUT/OUTPUT (opción A)
type PasswordFormIn  = z.input<typeof passwordSchema>;   // recordarme?: boolean
type PasswordFormOut = z.output<typeof passwordSchema>;  // recordarme:  boolean
type PatternFormIn   = z.input<typeof patternSchema>;
type PatternFormOut  = z.output<typeof patternSchema>;

// util para serializar el patrón
function serializePattern(points: number[]) {
  return points.join("-");
}

export default function Login() {
  const [tab, setTab] = useState<"password" | "pattern">("password");
  const { setToken } = useAuth();
  const nav = useNavigate();

  // ----- Contraseña -----
  const passForm = useForm<PasswordFormIn>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { recordarme: true },
    mode: "onChange",
  });

  const mutPass = useMutation({
    mutationFn: (v: PasswordFormIn) => loginPassword(v),
    onMutate: () => toast.loading("Ingresando...", { id: "auth" }),
    onSuccess: finishLogin,
    onError: (e: any) =>
      toast.error(e?.response?.data?.error ?? "No se pudo iniciar sesión", { id: "auth" }),
  });

  // ----- Patrón -----
  const patForm = useForm<PatternFormIn>({
    resolver: zodResolver(patternSchema),
    defaultValues: { recordarme: true, email: "" },
    mode: "onChange",
  });

  const [patternPoints, setPatternPoints] = useState<number[]>([]);

  // 👇 este effect DEBE ir dentro del componente y después de declarar estados/form
  useEffect(() => {
    if (tab === "pattern") {
      setPatternPoints([]);
      patForm.setValue("pattern", "", { shouldValidate: true });
    }
  }, [tab, patForm]);

  const mutPat = useMutation({
    mutationFn: (v: PatternFormIn) => loginWithPattern(v),
    onMutate: () => toast.loading("Verificando patrón...", { id: "auth" }),
    onSuccess: finishLogin,
    onError: (e: any) =>
      toast.error(e?.response?.data?.error ?? "No se pudo iniciar sesión con patrón", { id: "auth" }),
  });

  function finishLogin(data: any) {
    if (data.requiereConfirmacion || !data.accessToken) {
      toast.info("Revisa tu correo para confirmar la cuenta.", { id: "auth" });
      return;
    }
    const nombre = data.nombre ?? data.email?.split("@")[0] ?? "Usuario";

    saveSession({
      accessToken: data.accessToken,
      tokenType: data.tokenType,
      expiresIn: data.expiresIn,
      usuarioId: data.usuarioId,
      email: data.email,
    });
    setToken(data.accessToken);

    toast.success(`Bienvenido ${nombre}`, { id: "auth" });
    nav("/dashboard");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm">
          <button
            className={`py-2 rounded-md ${tab === "password" ? "bg-white shadow font-medium" : ""}`}
            onClick={() => setTab("password")}
            type="button"
          >
            Contraseña
          </button>
          <button
            className={`py-2 rounded-md ${tab === "pattern" ? "bg-white shadow font-medium" : ""}`}
            onClick={() => setTab("pattern")}
            type="button"
          >
            Patrón
          </button>
        </div>

        {tab === "password" ? (
          <form onSubmit={passForm.handleSubmit((v) => mutPass.mutate(v))} className="space-y-3" noValidate>
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                {...passForm.register("email")}
                className="w-full border rounded px-3 py-2"
                placeholder="tu@correo.com"
                inputMode="email"
                autoComplete="email"
                aria-invalid={!!passForm.formState.errors.email}
              />
              {passForm.formState.errors.email && (
                <p className="text-red-600 text-sm">{passForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                {...passForm.register("password")}
                className="w-full border rounded px-3 py-2"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!passForm.formState.errors.password}
              />
              {passForm.formState.errors.password && (
                <p className="text-red-600 text-sm">{passForm.formState.errors.password.message}</p>
              )}
            </div>

            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" {...passForm.register("recordarme")} />
              <span>Mantener la sesión iniciada</span>
            </label>

            <button
              type="submit"
              disabled={mutPass.isPending}
              className="mt-4 w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
            >
              {mutPass.isPending ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        ) : (
          <form onSubmit={patForm.handleSubmit((v) => mutPat.mutate(v))} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm mb-1" htmlFor="patEmail">Correo electrónico</label>
              <input
                id="patEmail"
                {...patForm.register("email")}
                className="w-full border rounded px-3 py-2"
                placeholder="tu@correo.com"
                inputMode="email"
                autoComplete="email"
              />
              {patForm.formState.errors.email && (
                <p className="text-red-600 text-sm">{patForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              <PatternPad
                size={280}
                path={patternPoints}
                onChange={setPatternPoints}
                onFinish={(pts) => {
                  const serial = serializePattern(pts);
                  patForm.setValue("pattern", serial, { shouldValidate: true });
                }}
              />
              <input type="hidden" {...patForm.register("pattern")} />
              {patForm.formState.errors.pattern && (
                <p className="text-red-600 text-sm">{patForm.formState.errors.pattern.message}</p>
              )}
            </div>

            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...patForm.register("recordarme")} />
              <span>Mantener la sesión iniciada</span>
            </label>

            <button
              type="submit"
              disabled={mutPat.isPending}
              className="w-full rounded bg-indigo-600 text-white py-2 hover:bg-indigo-700 disabled:opacity-60"
            >
              {mutPat.isPending ? "Verificando..." : "Entrar con patrón"}
            </button>
          </form>
        )}

        <div className="flex justify-between text-sm mt-6">
          <Link to="/auth/forgot" className="text-blue-600 hover:underline">¿Olvidaste tu contraseña?</Link>
          <Link to="/auth/register" className="text-blue-600 hover:underline">Crear cuenta</Link>
        </div>
      </div>
    </div>
  );
}
