'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/button/button';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';

import MentoraLogo from '@/public/assets/icons/mentora-logo.svg';
import { userController } from '@/controllers/userController';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [formData, setFormData] = useState<{
    password: string;
    confirmPassword: string;
  }>({
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setError('La confirmación de contraseña es requerida');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const result = await userController.resetPassword(token, formData.password, formData.confirmPassword);
      if (!result.success) {
        setError(result.message);
        return;
      } else {
        setSuccess('ok');
        setCountdown(10);
      }

    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!success) return;

    const intervalId = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [success]);

  useEffect(() => {
    if (success && countdown === 0) {
      router.push('/login');
    }
  }, [success, countdown, router]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-light-10 rounded-2xl shadow-lg p-8 border-4 border-surface-dark-70">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src={MentoraLogo} alt="Mentora" width={100} height={100} />
          </div>
          <h1 className="text-3xl font-bold text-secondary-color-70">
            Restablecer contraseña
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
              La contraseña fue modificada correctamente. Serás redirigido a la página de inicio de sesión en {countdown} segundos
            </div>
          )}

          <TextField
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading || !!success}
            status={error && !formData.password ? TextFieldStatus.error : TextFieldStatus.default}
          />

          <TextField
            label="Confirmación de contraseña"
            name="confirmPassword"
            type="password"
            placeholder="Ingresa tu confirmación de contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading || !!success}
            status={error && !formData.confirmPassword ? TextFieldStatus.error : TextFieldStatus.default}
          />

          <Button
            type="submit"
            size="lg"
            color="primary"
            variant="filled"
            className="w-full"
            disabled={isLoading || !!success}
          >
            {isLoading ? 'Restableciendo contraseña...' : 'Restablecer contraseña'}
          </Button>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-secondary-color-70 hover:text-primary-color-80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                router.push('/login');
              }}
            >
              Volver al login
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage;
