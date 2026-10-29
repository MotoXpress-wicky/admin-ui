import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { authApi } from '../api/authApi';
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore';
import { isAdmin } from '../lib/isAdmin';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  // Already logged in as an admin: nothing to do here.
  if (isAuthenticated && isAdmin(user)) return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      const loggedIn = await authApi.login(values);
      if (!isAdmin(loggedIn)) {
        // A normal customer account. Hiding pages is not security (every service checks ROLE_ADMIN too),
        // but there is nothing here for this person, so end the session at once.
        await authApi.logout().catch(() => undefined);
        setError('This account is not an administrator.');
        return;
      }
      setUser(loggedIn);
      navigate(from, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>MotoXpress Admin</h1>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {isAuthenticated && !isAdmin(user) && (
          <p role="alert" className="error">
            You are logged in, but not as an administrator.{' '}
            <button type="button" className="link-button" onClick={() => void logout()}>
              Log out
            </button>
          </p>
        )}
        <InputField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <InputField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </div>
  );
};
