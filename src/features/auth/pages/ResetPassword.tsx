// src/features/auth/pages/ResetPassword.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { restablecerContrasena } from "../api";
import { ApiError } from "../../../lib/http";

import {
  PuzzlePieceIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

/* =============== Validación =============== */
const schema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmar: z.string().min(6, "Confirma tu contraseña."),
  })
  .refine((v) => v.password === v.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden.",
  });
type FormData = z.infer<typeof schema>;

/** Lee params desde ?query y/o #hash (Supabase suele usar hash). */
function readToken(name: string): string | null {
  const sp = new URLSearchParams(window.location.search);
  const fromQuery = sp.get(name);
  if (fromQuery) return fromQuery;

  if (window.location.hash?.length > 1) {
    const hp = new URLSearchParams(window.location.hash.substring(1));
    const fromHash = hp.get(name);
    if (fromHash) return fromHash;
  }
  return null;
}

export default function ResetPassword() {
  const accessToken = readToken("access_token") ?? "";
  const refreshToken = readToken("refresh_token") ?? "";
  const nav = useNavigate();

  // Pasos: 0 = Nueva contraseña, 1 = Confirmación
  const [step, setStep] = useState<0 | 1>(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { password: "", confirmar: "" },
  });

  const mut = useMutation({
    mutationFn: async (v: FormData) =>
      restablecerContrasena({
        accessToken,
        refreshToken,
        password: v.password,
      }),
  });

  const goNext = async () => {
    const ok =
      (step === 0 && (await trigger("password"))) ||
      (step === 1 && (await trigger("confirmar")));
    if (!ok) {
      const msg =
        (step === 0 && errors.password?.message) ||
        (step === 1 && errors.confirmar?.message) ||
        "Revisa el campo.";
      toast.error(msg, { id: "reset" });
      return;
    }
    setJustUnlocked(step);
    setTimeout(() => setJustUnlocked(null), 600);

    if (step < 1) {
      toast.dismiss("reset");
      toast.success("Pieza desbloqueada ✅", { id: "reset" });
      setStep((s) => (s + 1) as any);
    }
  };

  const onSubmit = () =>
    toast.promise(
      (async () => {
        const ok = await trigger();
        if (!ok) throw new Error("Revisa los campos antes de continuar.");
        const v = getValues();
        await mut.mutateAsync(v);
        reset();
        setStep(0);
        setTimeout(() => nav("/auth/login"), 300);
      })(),
      {
        id: "reset",
        loading: "Actualizando contraseña...",
        success: "Contraseña actualizada. ¡Ya puedes iniciar sesión!",
        error: (e: any) => {
          if (e instanceof ApiError) return e.message;
          return (
            e?.response?.data?.message ??
            e?.message ??
            "No se pudo actualizar"
          );
        },
      }
    );

  const goBackStep = () => {
    if (step === 1) {
      setStep(0);            // vuelve a la primera pieza
      setShowConfirm(false); // opcional: ocultar estado visual del 2° input
    }
  };
  /* =============== Tablero (2 piezas) =============== */

  const board = { w: 420, h: 420 };
  const tile = { w: 184, h: 184 };
  const margin = { x: 20, y: 22 };

  const half = { x: board.w / 2, y: board.h / 2 };
  const corners = {
    topLeft: {
      x: -half.x + tile.w / 2 + margin.x,
      y: -half.y + tile.h / 2 + margin.y,
      rot: 8,
    },
    bottomRight: {
      x: +half.x - tile.w / 2 - margin.x,
      y: +half.y - tile.h / 2 - margin.y,
      rot: -6,
    },
  } as const;

  const homeByIndex: Record<number, keyof typeof corners> = {
    0: "topLeft",
    1: "bottomRight",
  };

  function tileTarget(i: number) {
    if (i === step) {
      return { x: 0, y: 0, rot: 0, z: 5, blur: 0, opacity: 1, scale: 1.02 };
    }
    const home = corners[homeByIndex[i]];
    const isDone = i < step;
    return {
      x: home.x,
      y: home.y,
      rot: home.rot,
      z: isDone ? 2 : 3,
      blur: isDone ? 2.5 : 2,
      opacity: isDone ? 0.75 : 0.9,
      scale: isDone ? 0.95 : 0.96,
    };
  }

  const tiles = useMemo(
    () => [
      {
        label: "Nueva contraseña",
        color: "bg-indigo-50 border-indigo-100",
        iconClass: "text-indigo-600",
        Icon: LockClosedIcon,
      },
      {
        label: "Confirmación",
        color: "bg-blue-50 border-blue-100",
        iconClass: "text-blue-600",
        Icon: ShieldCheckIcon,
      },
    ],
    []
  );

  const stepMeta = useMemo(() => {
    if (step === 0) {
      return {
        icon: <LockClosedIcon className="w-10 h-10 text-indigo-600" />,
        title: "Crea tu nueva contraseña",
        field: "password" as const,
        placeholder: "Nueva contraseña",
      };
    }
    return {
      icon: <ShieldCheckIcon className="w-10 h-10 text-blue-600" />,
      title: "Confirma tu nueva contraseña",
      field: "confirmar" as const,
      placeholder: "Repite la contraseña",
    };
  }, [step]);

  const tokenMissing = !accessToken || !refreshToken;

  useEffect(() => {
    if (tokenMissing) {
      toast.error("Faltan tokens de recuperación en la URL.", {
        id: "reset-token",
      });
    } else {
      toast.dismiss("reset-token");
    }
  }, [tokenMissing]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-6 pb-6 md:pb-0">
      <div className="w-full max-w-6xl">
        {/* Encabezado */}
        <div className="text-center pt-8 pb-12">
          <PuzzlePieceIcon className="w-11 h-11 mx-auto mb-3 text-rose-500" />
          <h1 className="text-[1.5rem] md:text-5xl font-extrabold text-slate-900">
            Restablece tu acceso
          </h1>
          <p className="text-slate-600 mt-2">
            Define una nueva contraseña para tu cuenta y vuelve a ingresar con
            seguridad.
          </p>
        </div>

        {/* Cuerpo (2 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10 items-center justify-items-center">
          {/* Tablero izquierda */}
          <div
            className="relative hidden md:block"
            style={{ width: board.w, height: board.h }}
          >
            <div className="absolute left-[30%] top-[20%] -translate-x-1/2 -translate-y-1/2">
              {tiles.map((t, i) => {
                const TIcon = t.Icon;
                const target = tileTarget(i);
                const style: React.CSSProperties = {
                  transform: `translate3d(${target.x}px, ${target.y}px, 0) rotate(${target.rot}deg) scale(${target.scale})`,
                  filter: target.blur ? `blur(${target.blur}px)` : "none",
                  opacity: target.opacity,
                  zIndex: target.z,
                  transition:
                    "transform 450ms cubic-bezier(.2,.9,.2,1), filter 450ms, opacity 450ms",
                };

                const isDone = i < step;

                return (
                  <div
                    key={i}
                    style={style}
                    className={[
                      "absolute rounded-[22px] h-44 w-44 md:h-48 md:w-48 grid place-items-center",
                      "border shadow-xl",
                      t.color,
                    ].join(" ")}
                  >
                    <div className="grid gap-2 place-items-center">
                      <TIcon className={`w-8 h-8 ${t.iconClass}`} />
                      <span
                        className={`font-semibold ${
                          i === step ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {t.label}
                      </span>
                    </div>

                    {isDone && (
                      <span className="absolute -bottom-3 bg-emerald-500 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow">
                        ✓ Completado
                      </span>
                    )}

                    {justUnlocked === i && (
                      <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-emerald-500 text-white grid place-items-center shadow-md animate-[pop_.5s_cubic-bezier(.2,.9,.2,1)]">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card derecha */}
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-xl px-6 md:px-10 py-8 md:py-10 border border-slate-100">
              <div className="mb-3">{stepMeta.icon}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                {stepMeta.title}
              </h3>
              <p className="text-slate-600 mb-5">
                Asegúrate de recordarla para tus próximos ingresos.
              </p>

              {tokenMissing && (
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                  Faltan <code>access_token</code> y/o{" "}
                  <code>refresh_token</code> en la URL.
                </p>
              )}

              {step === 0 && (
                <div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      {...register("password")}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-24 outline-none focus:border-blue-500"
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
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
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      {...register("confirmar")}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-24 outline-none focus:border-blue-500"
                      placeholder="Repite la contraseña"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmar}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-600 hover:text-slate-900"
                      tabIndex={-1}
                    >
                      {showConfirm ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {errors.confirmar && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.confirmar.message}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                {/* ← Volver: deshabilitado en el primer paso */}
                <button
                  type="button"
                  onClick={goBackStep}
                  disabled={step === 0}
                  aria-disabled={step === 0}
                  className="flex-1 text-center rounded-lg border border-slate-300 text-slate-700 py-3 font-medium hover:bg-slate-50
                            disabled:opacity-60 disabled:cursor-not-allowed"
                  title={step === 0 ? "Avanza al siguiente paso para habilitar" : "Volver al paso anterior"}
                >
                  ← Volver
                </button>

                {step < 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={tokenMissing}
                    className="flex-[2] rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-[0_10px_25px_rgba(37,99,235,.35)]"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={mut.isPending || tokenMissing}
                    className="flex-[2] rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-[0_10px_25px_rgba(37,99,235,.35)]"
                  >
                    {mut.isPending ? "Guardando..." : "Guardar contraseña"}
                  </button>
                )}
              </div>
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
        @keyframes pop { 0%{transform:scale(.92)}60%{transform:scale(1.08)}100%{transform:scale(1)} }
      `}</style>
    </div>
  );
}
