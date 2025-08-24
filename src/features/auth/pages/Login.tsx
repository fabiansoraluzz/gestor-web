// src/features/auth/pages/Login.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { saveSession } from "../../../lib/auth";
import { useAuth } from "../useAuth";
import { login } from "../api";

const schema = z.object({
  identifier: z.string().trim().min(3, "Ingresa tu usuario o correo."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const nav = useNavigate();
  const { setToken } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const mut = useMutation({
    mutationFn: (v: FormData) => login(v),
  });

  const onSubmit = (v: FormData) =>
    toast.promise(mut.mutateAsync(v), {
      id: "auth", // evita duplicados
      loading: "Ingresando...",
      success: (data: any) => {
        if (!data?.accessToken) return "No se pudo iniciar sesión";
        saveSession({
          accessToken: data.accessToken,
          tokenType: data.tokenType,
          expiresIn: data.expiresIn,
          usuarioId: data.usuarioId,
          email: data.email,
        });
        setToken(data.accessToken);
        nav("/dashboard");
        const nombre = data?.nombre ?? data?.username ?? data?.email?.split("@")[0] ?? "Usuario";
        return `Bienvenido ${nombre}`;
      },
      error: (e: any) => e?.response?.data?.error ?? "Credenciales inválidas",
    });

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center gap-10 px-6 md:px-12 bg-slate-50">
      {/* Lado ilustración (como tu captura) */}
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

            <button
              type="submit"
              disabled={mut.isPending}
              className="w-full rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-lg"
            >
              {mut.isPending ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="text-center mt-2">
              <Link to="/auth/forgot" className="text-rose-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
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
