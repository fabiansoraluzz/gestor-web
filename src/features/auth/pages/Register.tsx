import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { register as registerApi } from '../api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PatternPad from '../../../app/components/PatternPad';

// Schema con confirmación de contraseña y patrón opcional
const schema = z
  .object({
    nombreCompleto: z
      .string()
      .trim()
      .min(1, 'El nombre es obligatorio.')
      .min(2, 'El nombre debe tener al menos 2 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'El correo es obligatorio.')
      .email('Ingresa un correo válido.'),
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria.')
      .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
    pattern: z.string().min(3, 'Dibuja un patrón válido.').optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type FormIn = z.input<typeof schema>;

function serializePattern(points: number[]) {
  return points.join('-');
}

export default function Register() {
  const [withPattern, setWithPattern] = useState(false);
  const [patternPoints, setPatternPoints] = useState<number[]>([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(false); // rate-limit botón

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormIn>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    shouldFocusError: true,
  });

  const mut = useMutation({
    mutationFn: (v: FormIn) =>
      registerApi({
        nombreCompleto: v.nombreCompleto,
        email: v.email,
        password: v.password,
        pattern: v.pattern, // opcional
      }),
    onMutate: () => toast.loading('Creando cuenta...', { id: 'register' }),
    onSuccess: () => {
      toast.success('Registro exitoso. Revisa tu correo para confirmar la cuenta.', { id: 'register' });
      reset();
      setWithPattern(false);
      setPatternPoints([]);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? 'No se pudo registrar', { id: 'register' });
    },
  });

  const onSubmit = (v: FormIn) => {
    // rate-limit (evita doble click)
    if (cooldown) return;
    setCooldown(true);
    setTimeout(() => setCooldown(false), 800);

    if (withPattern && !v.pattern) {
      toast.error('Por favor dibuja tu patrón antes de continuar.', { id: 'register' });
      return;
    }
    mut.mutate(v);
  };

  const disablePad = mut.isPending || cooldown;

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow"
        noValidate
      >
        <h1 className="text-2xl font-semibold mb-6">Crear cuenta</h1>

        <label className="block text-sm mb-2" htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          {...register('nombreCompleto')}
          className="w-full border rounded px-3 py-2 mb-1"
          placeholder="Juan Pérez"
          autoComplete="name"
          aria-invalid={!!errors.nombreCompleto}
        />
        {errors.nombreCompleto && (
          <p className="text-red-600 text-sm mb-3">{errors.nombreCompleto.message}</p>
        )}

        <label className="block text-sm mb-2" htmlFor="correo">Correo electrónico</label>
        <input
          id="correo"
          {...register('email')}
          className="w-full border rounded px-3 py-2 mb-1"
          placeholder="tu@correo.com"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-red-600 text-sm mb-3">{errors.email.message}</p>}

        <label className="block text-sm mb-2 mt-2" htmlFor="pass">Contraseña</label>
        <div className="relative">
          <input
            id="pass"
            type={showPass ? 'text' : 'password'}
            {...register('password')}
            className="w-full border rounded px-3 py-2 pr-20"
            placeholder="Crea una contraseña"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-600 hover:text-slate-900"
            tabIndex={-1}
          >
            {showPass ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errors.password && <p className="text-red-600 text-sm mb-3">{errors.password.message}</p>}

        <label className="block text-sm mb-2 mt-2" htmlFor="confirm">Confirmar contraseña</label>
        <div className="relative">
          <input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            {...register('confirmPassword')}
            className="w-full border rounded px-3 py-2 pr-20"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-600 hover:text-slate-900"
            tabIndex={-1}
          >
            {showConfirm ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mb-3">{errors.confirmPassword.message}</p>
        )}

        {/* Toggle patrón */}
        <label className="inline-flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={withPattern}
            onChange={(e) => {
              const on = e.target.checked;
              setWithPattern(on);
              if (!on) {
                setPatternPoints([]);
                setValue('pattern', undefined, { shouldValidate: true });
              }
            }}
          />
          <span>Definir patrón ahora (opcional)</span>
        </label>

        {withPattern && (
          <div className="mt-4">
            <div className={`flex flex-col items-center gap-3 ${disablePad ? 'opacity-60 pointer-events-none' : ''}`}>
              <PatternPad
                size={280}
                path={patternPoints}
                onChange={setPatternPoints}
                onFinish={(pts) => {
                  const serial = serializePattern(pts);
                  setValue('pattern', serial, { shouldValidate: true });
                }}
              />
              {/* input oculto para el schema */}
              <input type="hidden" {...register('pattern')} />
              {errors.pattern && (
                <p className="text-red-600 text-sm">{errors.pattern.message}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={mut.isPending || cooldown}
          className="mt-6 w-full rounded bg-rose-600 text-white py-2 hover:bg-rose-700 disabled:opacity-60"
        >
          {mut.isPending ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="text-sm mt-4">
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
