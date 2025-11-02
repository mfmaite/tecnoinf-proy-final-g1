'use client';
import React, { useState } from 'react';
import Image from 'next/image';

import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { Button } from '@/components/button/button';
import MentoraLogo from '@/public/assets/icons/mentora-logo.svg';
import { userController } from '@/controllers/userController';

const ForgotPassword = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userEmail.trim()) {
      setError('El email es requerido');
      return;
    }

    setIsLoading(true);

    try {
      await userController.forgotPassword(userEmail);
      setSuccess(true);
    } catch (error) {
      console.error('Error al enviar el email de recuperación de contraseña:', error);
      setError('Error al enviar el email de recuperación de contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      {success ? (
        <div className="w-full max-w-md bg-surface-light-10 rounded-2xl shadow-lg p-8 border-4 border-surface-dark-70 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center mb-4">
            <Image src={MentoraLogo} alt="Mentora" width={100} height={100} />
          </div>
          <h1 className="text-3xl font-bold text-secondary-color-70">
            Email enviado
          </h1>
          <p className="text-center text-text-neutral-50">
            Se ha enviado un email de recuperación de contraseña a tu correo electrónico.
          </p>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-secondary-color-70 hover:text-primary-color-80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              Volver al login
            </a>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-surface-light-10 rounded-2xl shadow-lg p-8 border-4 border-surface-dark-70">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src={MentoraLogo} alt="Mentora" width={100} height={100} />
          </div>
          <h1 className="text-3xl font-bold text-secondary-color-70">
            Recuperar contraseña
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <TextField
            label="Email"
            name="email"
            type="email"
            placeholder="Ingresa tu email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            disabled={isLoading}
            status={error && !userEmail ? TextFieldStatus.error : TextFieldStatus.default}
            autoComplete="username"
          />

          <Button
            type="submit"
            size="lg"
            color="primary"
            variant="filled"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando email...' : 'Enviar email'}
          </Button>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-secondary-color-70 hover:text-primary-color-80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              Volver al login
            </a>
          </div>
        </form>
      </div>
      )}
    </div>
  )
}

export { ForgotPassword }
