import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '../api';
import { useAuth } from '../useAuth';
import { saveSession } from '../../../lib/auth';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.').min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  recordarme: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { setToken } = useAuth();
  const nav = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recordarme: true },
    mode: 'onChange',
    shouldFocusError: true,
  });

  const mut = useMutation({
    mutationFn: login,
    onMutate: () => toast.loading('Ingresando...', { id: 'auth' }),
    onSuccess: (data) => {
      if (data.requiereConfirmacion || !data.accessToken) {
        toast.info('Revisa tu correo para confirmar la cuenta.', { id: 'auth' });
        return;
      }
      const nombre = data.nombre ?? (data.email?.split('@')[0] ?? 'Usuario');

      saveSession({
        accessToken: data.accessToken,
        tokenType: data.tokenType,
        expiresIn: data.expiresIn,
        usuarioId: data.usuarioId,
        email: data.email,
      });
      setToken(data.accessToken);

      toast.success(`Bienvenido ${nombre}`, { id: 'auth' });
      nav('/dashboard');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? 'No se pudo iniciar sesión', { id: 'auth' });
    },
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={handleSubmit((v) => mut.mutate(v))}
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow"
            noValidate>
        <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>

        <label className="block text-sm mb-2" htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          {...register('email')}
          className="w-full border rounded px-3 py-2 mb-1"
          placeholder="tu@correo.com"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-red-600 text-sm mb-3">{errors.email.message}</p>}

        <label className="block text-sm mb-2 mt-2" htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full border rounded px-3 py-2 mb-1"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="text-red-600 text-sm mb-3">{errors.password.message}</p>}

        <label className="inline-flex items-center gap-2 mt-2">
          <input type="checkbox" {...register('recordarme')} />
          <span>Mantener la sesión iniciada</span>
        </label>

        <button
          type="submit"
          disabled={mut.isPending}
          className="mt-6 w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {mut.isPending ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <div className="flex justify-between text-sm mt-4">
          <Link to="/auth/forgot" className="text-blue-600 hover:underline">¿Olvidaste tu contraseña?</Link>
          <Link to="/auth/register" className="text-blue-600 hover:underline">Crear cuenta</Link>
        </div>
      </form>
    </div>
  );
}
