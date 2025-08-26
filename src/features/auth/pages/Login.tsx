// src/features/auth/pages/Login.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { saveSession } from "../../../lib/auth";
import { useAuth, __authInternals } from "../useAuth";
import { iniciarSesion } from "../api";
import { ApiError } from "../../../lib/http";

const schema = z.object({
  identifier: z.string().trim().min(3, "Ingresa tu usuario o correo."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  remember: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const nav = useNavigate();
  const { setToken } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { remember: true },
  });

  const mut = useMutation({
    mutationFn: async (v: FormData) => {
      const isEmail = v.identifier.includes("@");
      const payload = isEmail
        ? { email: v.identifier, password: v.password, remember: v.remember }
        : { username: v.identifier, password: v.password, remember: v.remember };
      return iniciarSesion(payload);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (v) => {
    toast.promise(mut.mutateAsync(v), {
      id: "auth",
      loading: "Ingresando...",
      success: (session) => {
        if (!session?.accessToken) return "No se pudo iniciar sesión";

        // Guardar en el storage correcto según remember
        saveSession(
          {
            accessToken: session.accessToken!,
            tokenType: session.tokenType ?? undefined,
            expiresIn: session.expiresIn ?? undefined,
            usuarioId: session.usuarioId ?? undefined,
            email: session.email ?? undefined,
          },
          v.remember
        );

        // Persistimos la preferencia para rehidratación futura
        __authInternals.setRememberFlag(!!v.remember);

        setToken(session.accessToken!);
        nav("/dashboard");

        const nombre =
          session?.nombre ??
          session?.usuario ??
          session?.email?.split?.("@")?.[0] ??
          "Usuario";
        return `Bienvenido ${nombre}`;
      },
      error: (e: any) => {
        if (e instanceof ApiError) {
          return e.message || "No se pudo iniciar sesión";
        }
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          "No se pudo iniciar sesión";
        return msg;
      },
    });
  };

  const rememberChecked = watch("remember");

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center gap-10 px-6 md:px-12 bg-slate-50">
      {/* Lado ilustración */}
      <div className="hidden md:block">
        <div className="w-full aspect-square max-w-[560px] bg-gradient-to-br from-blue-50 via-indigo-50 to-rose-50 rounded-xl shadow-inner mx-auto grid place-items-center">
          <div className="w-3/4 aspect-square rounded-full bg-blue-500/90 shadow-2xl" />
        </div>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl px-6 md:px-10 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">
            Bienvenido
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <input
                {...register("identifier")}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Usuario o Email"
                aria-invalid={!!errors.identifier}
              />
              {errors.identifier && (
                <p className="text-red-600 text-sm mt-1">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-24 outline-none focus:border-blue-500"
                  placeholder="Password"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-600 hover:text-slate-900"
                  tabIndex={-1}
                >
                  {showPass ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Mantener sesión activa */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                {/* input accesible (oculto) controlado por RHF */}
                <input type="checkbox" {...register("remember")} className="sr-only" />

                {/* círculo minimalista que reacciona al estado */}
                <span
                  className={[
                    "relative grid place-items-center h-5 w-5 rounded-full bg-white transition-shadow",
                    rememberChecked
                      ? "border border-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,.12)]"
                      : "border border-slate-300 hover:shadow-sm",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full bg-blue-600 transition-transform",
                      rememberChecked ? "scale-100" : "scale-0",
                    ].join(" ")}
                  />
                </span>

                <span className="text-sm text-slate-700">Mantener sesión activa</span>
              </label>

              <Link to="/auth/forgot" className="text-sm text-rose-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={mut.isPending}
              className="w-full rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-lg"
            >
              {mut.isPending ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
