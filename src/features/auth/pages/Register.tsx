// src/features/auth/pages/Register.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registrarUsuario } from "../api";

import {
  PuzzlePieceIcon,
  UserIcon,
  EnvelopeIcon,
  AtSymbolIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { ApiError } from "../../../lib/http";

/* ======================= Validación y helpers ======================= */
const nombreCompletoSchema = z
  .string()
  .trim()
  .min(1, "Ingresa tu nombre completo.")
  .refine((s) => s.trim().length > 0, { message: "Ingresa tu nombre completo." })
  .refine((s) => s.trim().split(/\s+/).length >= 2, { message: "Ingresa tus apellidos." });

const schema = z.object({
  nombreCompleto: nombreCompletoSchema,
  email: z.string().trim().email("Ingresa un correo válido."),
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(32, "Máx. 32 caracteres.")
    .regex(/^[a-z0-9._-]+$/i, "Sólo letras/números y . _ -"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});
type FormData = z.infer<typeof schema>;

function splitFullName(full: string) {
  const p = full.trim().split(/\s+/);
  if (p.length === 1) return { nombres: p[0], apellidos: "" };
  if (p.length === 2) return { nombres: p[0], apellidos: p[1] };
  return { nombres: p.slice(0, -2).join(" "), apellidos: p.slice(-2).join(" ") };
}

// Extrae segundos desde mensajes como "after 27 seconds"
function parseCooldownSeconds(input: unknown, fallback = 30): number {
  const txt =
    Array.isArray(input) ? input.join(" ") :
    typeof input === "string" ? input :
    "";
  const m = String(txt).match(/after\s+(\d+)\s*seconds?/i) || String(txt).match(/(\d+)\s*s(ec(onds)?)?/i);
  return m ? Math.max(1, parseInt(m[1], 10)) : fallback;
}

/* ======================= Componente ======================= */
export default function Register() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [showPass, setShowPass] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0); // ⏱️ segundos restantes para reintentar

  // Refs por campo para autofoco + autoselección
  const nombreRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    trigger,
    setValue,
    watch,
    formState: { errors },
    getValues,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { nombreCompleto: "", email: "", username: "", password: "" },
  });

  // Guardar descriptors de registro por campo (para combinar ref)
  const nombreReg   = register("nombreCompleto");
  const emailReg    = register("email");
  const usernameReg = register("username");
  const passwordReg = register("password");

  // Normalizar username a minúsculas
  const username = watch("username");
  useEffect(() => {
    if (!username) return;
    const lower = username.toLowerCase();
    if (lower !== username) setValue("username", lower, { shouldValidate: true });
  }, [username, setValue]);

  // ⛳ Autofoco + selección al cambiar step (y en primer render)
  useEffect(() => {
    const refByStep: Record<number, React.RefObject<HTMLInputElement | null>> = {
      0: nombreRef,
      1: emailRef,
      2: usernameRef,
      3: passwordRef,
    };
    const t = setTimeout(() => {
      const el = refByStep[step]?.current;
      if (el) {
        el.focus({ preventScroll: true });
        try { el.select?.(); } catch {}
      }
    }, 10);
    return () => clearTimeout(t);
  }, [step]);

  // Decrementar cooldown 1s
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const mut = useMutation({
    mutationFn: async (v: FormData) => {
      const { nombres, apellidos } = splitFullName(v.nombreCompleto);
      return registrarUsuario({
        username: v.username,
        email: v.email,
        password: v.password,
        nombres,
        apellidos,
      });
    },
  });

  // Muestra toast con el mensaje del campo del paso actual
  const showStepError = () => {
    const map: Record<number, string | undefined> = {
      0: errors.nombreCompleto?.message,
      1: errors.email?.message,
      2: errors.username?.message,
      3: errors.password?.message,
    };
    const msg = map[step];
    if (msg) toast.error(msg, { id: "register-step" });
  };

  // Avanzar/volver pasos
  const goNext = async () => {
    const ok =
      (step === 0 && (await trigger("nombreCompleto"))) ||
      (step === 1 && (await trigger("email"))) ||
      (step === 2 && (await trigger("username"))) ||
      (step === 3 && (await trigger("password")));
    if (!ok) {
      showStepError();
      return;
    }

    setJustUnlocked(step);
    setTimeout(() => setJustUnlocked(null), 600);

    if (step < 3) {
      toast.dismiss("register-step");
      toast.success("Pieza desbloqueada ✅", { id: "register" });
      setStep((s) => (s + 1) as any);
    }
  };

  const goBack = () => step > 0 && setStep((s) => (s - 1) as any);

  // Enter en formulario → siguiente pieza o crear
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      void goNext();
    } else {
      void onSubmit();
    }
  };

  const onSubmit = () =>
    toast.promise(
      (async () => {
        // valida todos; si algo falla, movemos el step al primer error y mostramos su mensaje
        const okAll = await trigger();
        if (!okAll) {
          const order: Array<keyof FormData> = ["nombreCompleto", "email", "username", "password"];
          const firstKey = order.find((k) => errors[k]);
          if (firstKey) {
            const stepFromKey: Record<keyof FormData, 0 | 1 | 2 | 3> = {
              nombreCompleto: 0,
              email: 1,
              username: 2,
              password: 3,
            };
            setStep(stepFromKey[firstKey]);
            toast.error(errors[firstKey]?.message ?? "Campo inválido", { id: "register-first" });
          }
          throw new Error("Formulario inválido");
        }

        const v = getValues();
        await mut.mutateAsync(v);

        // ✅ SIN redirección. Mostramos banner y limpiamos el formulario.
        setShowSuccess(true);
        reset();
        setStep(0);
      })(),
      {
        id: "register",
        loading: "Creando cuenta...",
        success: "Registro exitoso. Revisa tu correo para confirmar la cuenta.",
        error: (e: any) => {
          if (e instanceof ApiError) {
            // Duplicados mapeados por el API
            if (e.code === "DB.DUPLICATE.EMAIL") return "El correo ya está registrado";
            if (e.code === "DB.DUPLICATE.USERNAME") return "Ese usuario ya está en uso";
            if (e.code === "DB.DUPLICATE.AUTH_USER") return "Ese usuario de autenticación ya tiene un perfil";
            if (e.code === "DB.DUPLICATE") return "Perfil duplicado";

            // Rate limiting → activar cooldown y deshabilitar botón
            if (e.code === "AUTH.RATE_LIMITED") {
              const secs = parseCooldownSeconds(e.payload);
              setCooldown(secs);
              return "Demasiadas solicitudes para este correo. Intenta más tarde.";
            }

            // Validaciones de negocio directas
            if (e.code === "VALIDATION.BAD_REQUEST" && e.message) return e.message;
          }
          return e?.response?.data?.message ?? e?.message ?? "No se pudo registrar";
        },
      }
    );

  /* ======================= Tablero y UI (intactos) ======================= */

  const board = { w: 420, h: 420 };
  const tile = { w: 184, h: 184 };
  const margin = { x: 20, y: 22 };

  const half = { x: board.w / 2, y: board.h / 2 };
  const corners = {
    topLeft: { x: -half.x + tile.w / 2 + margin.x, y: -half.y + tile.h / 2 + margin.y, rot: 8 },
    topRight: { x: +half.x - tile.w / 2 - margin.x, y: -half.y + tile.h / 2 + margin.y, rot: -6 },
    bottomRight: { x: +half.x - tile.w / 2 - margin.x, y: +half.y - tile.h / 2 - margin.y, rot: 5 },
    bottomLeft: { x: -half.x + tile.w / 2 + margin.x, y: +half.y - tile.h / 2 - margin.y, rot: -8 },
  } as const;

  const homeByIndex: Record<number, keyof typeof corners> = {
    0: "topLeft",
    1: "topRight",
    2: "bottomRight",
    3: "bottomLeft",
  };

  function tileTarget(i: number) {
    if (i === step) return { x: 0, y: 0, rot: 0, z: 5, blur: 0, opacity: 1, scale: 1.02 };
    const home = corners[homeByIndex[i]];
    const isDone = i < step;
    return {
      x: home.x,
      y: home.y,
      rot: home.rot,
      z: isDone ? 2 : 3,
      blur: isDone ? 2.5 : 2,
      opacity: isDone ? 0.75 : 0.88,
      scale: isDone ? 0.95 : 0.96,
    };
  }

  const tiles = useMemo(
    () => [
      { label: "Nombre", color: "bg-rose-50 border-rose-100", iconClass: "text-rose-500", Icon: UserIcon },
      { label: "Email", color: "bg-blue-50 border-blue-100", iconClass: "text-blue-500", Icon: EnvelopeIcon },
      { label: "Usuario", color: "bg-indigo-50 border-indigo-100", iconClass: "text-indigo-500", Icon: AtSymbolIcon },
      { label: "Contraseña", color: "bg-slate-50 border-slate-200", iconClass: "text-slate-700", Icon: LockClosedIcon },
    ],
    []
  );

  const stepMeta = useMemo(() => {
    switch (step) {
      case 0:
        return { icon: <UserIcon className="w-10 h-10 text-rose-500" />, title: "¿Cómo te llamas?", field: "nombreCompleto" as const, placeholder: "Tu nombre completo" };
      case 1:
        return { icon: <EnvelopeIcon className="w-10 h-10 text-blue-500" />, title: "¿Cuál es tu correo principal?", field: "email" as const, placeholder: "tu@correo.com" };
      case 2:
        return { icon: <AtSymbolIcon className="w-10 h-10 text-indigo-500" />, title: "Elige tu usuario para iniciar sesión", field: "username" as const, placeholder: "tu-usuario" };
      default:
        return { icon: <LockClosedIcon className="w-10 h-10 text-slate-700" />, title: "Crea una contraseña segura", field: "password" as const, placeholder: "Crea una contraseña" };
    }
  }, [step]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-6 pb-6 md:pb-0">
      <div className="w-full max-w-6xl">
        {/* Encabezado */}
        <div className="text-center pt-8 pb-12">
          <PuzzlePieceIcon className="w-11 h-11 mx-auto mb-3 text-rose-500" />
          <h1 className="text-[1.5rem] md:text-5xl font-extrabold text-slate-900">
            Arma el Rompecabezas de tu Cuenta
          </h1>
          <p className="text-slate-600 mt-2">
            Cada pieza es un paso clave. Responde la pregunta para desbloquearla y ver cómo tu perfil toma forma.
          </p>
        </div>

        {/* Cuerpo (2 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10 items-center justify-items-center">
          {/* Columna izquierda: tablero — oculto en móvil */}
          <div className="relative hidden md:block" style={{ width: board.w, height: board.h }}>
            {/* Ancla reubicada: 30% / 20% */}
            <div className="absolute left-[30%] top-[20%] -translate-x-1/2 -translate-y-1/2">
              {tiles.map((t, i) => {
                const TIcon = t.Icon;
                const target = tileTarget(i);
                const style: React.CSSProperties = {
                  transform: `translate3d(${target.x}px, ${target.y}px, 0) rotate(${target.rot}deg) scale(${target.scale})`,
                  filter: target.blur ? `blur(${target.blur}px)` : "none",
                  opacity: target.opacity,
                  zIndex: target.z,
                  transition: "transform 450ms cubic-bezier(.2,.9,.2,1), filter 450ms, opacity 450ms",
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
                      <span className={`font-semibold ${i === step ? "text-slate-800" : "text-slate-500"}`}>
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

          {/* Columna derecha: Card */}
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-xl px-6 md:px-10 py-8 md:py-10 border border-slate-100">
              <div className="mb-3">{stepMeta.icon}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                {stepMeta.title}
              </h3>
              <p className="text-slate-600 mb-5">Esta información es esencial para configurar tu cuenta.</p>

              <form onSubmit={handleFormSubmit} noValidate>
                {step === 0 && (
                  <div>
                    <input
                      {...nombreReg}
                      ref={(el) => { nombreRef.current = el; nombreReg.ref(el); }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="Tu nombre completo"
                      aria-invalid={!!errors.nombreCompleto}
                    />
                    {errors.nombreCompleto && (
                      <p className="text-red-600 text-sm mt-1">{errors.nombreCompleto.message}</p>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <input
                      {...emailReg}
                      ref={(el) => { emailRef.current = el; emailReg.ref(el); }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="tu@correo.com"
                      inputMode="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <input
                      {...usernameReg}
                      ref={(el) => { usernameRef.current = el; usernameReg.ref(el); }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="tu-usuario"
                      aria-invalid={!!errors.username}
                    />
                    {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
                    <p className="text-xs text-slate-500 mt-2">
                      Se aceptan letras, números y . _ - (3 a 32 caracteres).
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <div className="relative">
                      <input
                        {...passwordReg}
                        ref={(el) => { passwordRef.current = el; passwordReg.ref(el); }}
                        type={showPass ? "text" : "password"}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-24 outline-none focus:border-blue-500"
                        placeholder="Crea una contraseña"
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
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                  </div>
                )}

                {showSuccess && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3 text-sm animate-[pop_.5s_cubic-bezier(.2,.9,.2,1)]">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Cuenta creada. Revisa tu correo para confirmar.</span>
                  </div>
                )}

                {/* Botonera */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0}
                    className="flex-1 rounded-lg border border-slate-300 text-slate-700 py-3 font-medium hover:bg-slate-50 disabled:opacity-60"
                  >
                    ← Volver
                  </button>

                  {step < 3 ? (
                    <button
                      type="submit"
                      className="flex-[2] rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-[0_10px_25px_rgba(37,99,235,.35)]"
                    >
                      Siguiente Pieza →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={mut.isPending || cooldown > 0}
                      className="flex-[2] rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 shadow-[0_10px_25px_rgba(37,99,235,.35)]"
                    >
                      {mut.isPending
                        ? "Creando..."
                        : cooldown > 0
                        ? `Reintentar en ${cooldown}s`
                        : "Crear cuenta"}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* link inferior */}
            <p className="text-center text-sm text-slate-600 mt-6">
              ¿Ya tienes una cuenta?{" "}
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
