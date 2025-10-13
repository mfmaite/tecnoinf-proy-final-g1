'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { Button } from '@/components/button/button';
import { authController } from '@/controllers/authController';
import { UserLoginData } from '@/types/user';

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<UserLoginData>({
    ci: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

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

    if (!formData.ci.trim()) {
      setError('La cédula es requerida');
      return;
    }

    if (!formData.password) {
      setError('La contraseña es requerida');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authController.login(formData);

      if (response.success) {
        router.push('/');
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-light-10 rounded-2xl shadow-lg p-8 border-4 border-surface-dark-70">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src="/assets/images/logo-mentora.png" alt="Mentora" width={100} height={100} />
          </div>
          <h1 className="text-6xl font-bold text-secondary-color-70">
            Mentora
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <TextField
            label="Cédula"
            name="ci"
            type="text"
            placeholder="Ingresa tu cédula"
            value={formData.ci}
            onChange={handleChange}
            disabled={isLoading}
            status={error && !formData.ci ? TextFieldStatus.error : TextFieldStatus.default}
            autoComplete="username"
          />

          <div className="relative">
            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              status={error && !formData.password ? TextFieldStatus.error : TextFieldStatus.default}
              autoComplete="current-password"
              rightIcon={() => (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#1A4D26"
                  className="w-5 h-5"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              )}
              onRightIconClick={togglePasswordVisibility}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            color="primary"
            variant="filled"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-secondary-color-70 hover:text-primary-color-80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Funcionalidad de recuperación de contraseña próximamente');
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export { LoginForm };
