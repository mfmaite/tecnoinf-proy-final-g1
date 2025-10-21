'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { Button } from '@/components/button/button';
import { UserSignUpData } from '@/types/user';
import { SelectField } from '@/components/select-field/select-field';
import { userController } from '@/controllers/userController';

const initialFormData: UserSignUpData = {
  ci: '',
  name: '',
  email: '',
  password: '',
  description: '',
  pictureUrl: '',
  role: 'ESTUDIANTE',
}

const CreateUserForm = () => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState<UserSignUpData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.ci.trim()) {
      setError('La cédula es requerida');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!formData.password) {
      setError('La contraseña es requerida');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await userController.createUser(formData, accessToken!);

      if (result.success) {
        setSuccess(result.message);
        setFormData(initialFormData);
      } else {
        setError(result.message);
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
    <div>
      <div className="w-full flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-surface-light-10 rounded-2xl shadow-lg p-8 border-4 border-surface-dark-70">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-secondary-color-70 mb-2">
            Crear Usuario
          </h1>

          <p className="text-gray-600 text-center">
            Complete los datos para crear un nuevo usuario en el sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Cédula"
              name="ci"
              type="text"
              placeholder="Ingresa la cédula"
              value={formData.ci}
              onChange={handleChange}
              disabled={isLoading}
              status={error && !formData.ci ? TextFieldStatus.error : TextFieldStatus.default}
              autoComplete="username"
            />

            <TextField
              label="Nombre Completo"
              name="name"
              type="text"
              placeholder="Ingresa el nombre completo"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              status={error && !formData.name ? TextFieldStatus.error : TextFieldStatus.default}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="Ingresa el email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              status={error && !formData.email ? TextFieldStatus.error : TextFieldStatus.default}
              autoComplete="email"
            />

            <SelectField
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              options={[{ value: 'ESTUDIANTE', label: 'Estudiante' }, { value: 'PROFESOR', label: 'Profesor' }, { value: 'ADMIN', label: 'Administrador' }]}
            />
          </div>

          <div className="relative">
            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa la contraseña"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              status={error && !formData.password ? TextFieldStatus.error : TextFieldStatus.default}
              autoComplete="new-password"
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

          <TextField
            label="Descripción (Opcional)"
            name="description"
            type="text"
            placeholder="Ingresa una descripción del usuario"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            status={TextFieldStatus.default}
          />

          <TextField
            label="URL de Imagen (Opcional)"
            name="pictureUrl"
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={formData.pictureUrl}
            onChange={handleChange}
            disabled={isLoading}
            status={TextFieldStatus.default}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              size="lg"
              color="secondary"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => router.push('/admin/users')}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="lg"
              color="primary"
              variant="filled"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Creando usuario...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
