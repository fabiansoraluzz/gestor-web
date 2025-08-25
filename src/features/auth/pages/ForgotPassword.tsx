// src/features/auth/pages/ForgotPassword.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { olvideContrasena } from "../api";

import { PuzzlePieceIcon, EnvelopeIcon } from "@heroicons/react/24/solid";

const schema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
});
type FormData = z.infer<typeof schema>;

const RESET_REDIRECT = import.meta.env.VITE_PASSWORD_RESET_REDIRECT as string | undefined;

export default function ForgotPassword() {
  const [showMark, setShowMark] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors }, getValues, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const mut = useMutation({
    mutationFn: async (v: FormData) => olvideContrasena(v.email, RESET_REDIRECT),
  });

  const onSubmit = () =>
    toast.promise(
      (async () => {
        const ok = await trigger("email");
        if (!ok) throw new Error("Revisa el correo antes de continuar.");
        const v = getValues();
        await mut.mutateAsync(v);
        setShowMark(true);
        reset({ email: "" });
      })(),
      {
        id: "forgot",
        loading: "Enviando enlace...",
        success: "Si el correo existe, se envió un enlace de restablecimiento.",
        error: (e: any) => e?.message ?? e?.response?.data?.message ?? "No se pudo enviar el enlace",
      }
    );

  /* UI original intacta a partir de aquí */
  const board = { w: 420, h: 420 };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-6 pb-6 md:pb-0">
      <div className="w-full max-w-6xl">
        <div className="text-center pt-8 pb-12">
          <PuzzlePieceIcon className="w-11 h-11 mx-auto mb-3 text-rose-500" />
          <h1 className="text-[1.5rem] md:text-5xl font-extrabold text-slate-900">
            Recupera el acceso a tu cuenta
          </h1>
          <p className="text-slate-600 mt-2">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10 items-center justify-items-center">
          <div className="relative hidden md:block" style={{ width: board.w, height: board.h }}>
            <div className="absolute left-[30%] top-[20%] -translate-x-1/2 -translate-y-1/2">
              <div
                className={[
                  "absolute rounded-[22px] h-44 w-44 md:h-48 md:w-48 grid place-items-center",
                  "border shadow-xl bg-blue-50 border-blue-100",
                ].join(" ")}
                style={{ transform: "translate3d(0,0,0) rotate(0deg) scale(1.02)" }}
              >
                <div className="grid gap-2 place-items-center">
                  <EnvelopeIcon className="w-8 h-8 text-blue-500" />
                  <span className="font-semibold text-slate-800">Email</span>
                </div>

                {showMark && (
                  <span
                    className="absolute -bottom-3 bg-emerald-500 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow
                               animate-[fadeOut_1.6s_ease_forwards]"
                    onAnimationEnd={() => setShowMark(false)}
                  >
                    ✓ Enlace enviado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-xl px-6 md:px-10 py-8 md:py-10 border border-slate-100">
              <div className="mb-3">
                <EnvelopeIcon className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                ¿Cuál es tu correo registrado?
              </h3>
              <p className="text-slate-600 mb-5">
                Te enviaremos un email con el enlace de recuperación.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
                noValidate
              >
                <div>
                  <input
                    {...register("email")}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="tu@correo.com"
                    inputMode="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    to="/auth/login"
                    className="flex-1 text-center rounded-lg border border-slate-300 text-slate-700 py-3 font-medium hover:bg-slate-50"
                  >
                    ← Volver
                  </Link>

                  <button
                    type="submit"
                    disabled={mut.isPending}
                    className="flex-[2] rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-[0_10px_25px_rgba(37,99,235,.35)]"
                  >
                    {mut.isPending ? "Enviando..." : "Enviar enlace"}
                  </button>
                </div>
              </form>
            </div>

            <p className="text-center text-sm text-slate-600 mt-6">
              ¿Recordaste tu contraseña?{" "}
              <Link to="/auth/login" className="text-blue-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          60% { opacity: .7; }
          100% { opacity: 0; transform: translateY(2px) scale(.98); }
        }
      `}</style>
    </div>
  );
}
