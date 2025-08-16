import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPassword } from '../api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    shouldFocusError: true,
  });

  const mut = useMutation({
    mutationFn: (v: FormData) => forgotPassword(v.email),
    onMutate: () => toast.loading('Enviando enlace...', { id: 'forgot' }),
    onSuccess: () => {
      toast.success('Si el correo existe, se envió un enlace de restablecimiento.', { id: 'forgot' });
      reset();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? 'No se pudo enviar el enlace', { id: 'forgot' });
    },
  });

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form
        onSubmit={handleSubmit((v) => mut.mutate(v))}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow"
        noValidate
      >
        <h1 className="text-2xl font-semibold mb-6">Recuperar contraseña</h1>

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

        <button
          type="submit"
          disabled={mut.isPending}
          className="mt-6 w-full rounded bg-amber-600 text-white py-2 hover:bg-amber-700 disabled:opacity-60"
        >
          {mut.isPending ? 'Enviando...' : 'Enviar enlace'}
        </button>

        <div className="text-sm mt-4">
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
