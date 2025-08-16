import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { register as registerApi } from '../api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const schema = z.object({
  nombreCompleto: z.string().trim().min(1, 'El nombre es obligatorio.').min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.').min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    shouldFocusError: true,
  });

  const mut = useMutation({
    mutationFn: registerApi,
    onMutate: () => toast.loading('Creando cuenta...', { id: 'register' }),
    onSuccess: () => {
      toast.success('Registro exitoso. Revisa tu correo para confirmar la cuenta.', { id: 'register' });
      reset();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? 'No se pudo registrar', { id: 'register' });
    },
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form
        onSubmit={handleSubmit((v) => mut.mutate(v))}
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
        {errors.nombreCompleto && <p className="text-red-600 text-sm mb-3">{errors.nombreCompleto.message}</p>}

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
        <input
          id="pass"
          type="password"
          {...register('password')}
          className="w-full border rounded px-3 py-2 mb-1"
          placeholder="Crea una contraseña"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="text-red-600 text-sm mb-3">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={mut.isPending}
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
