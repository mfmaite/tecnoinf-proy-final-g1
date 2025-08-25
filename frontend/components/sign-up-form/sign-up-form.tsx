'use client';

import { useState } from 'react';
import { userController } from '../../controllers/userController';
import type { UserSignUpData } from '../../types/user';
import { TextField, TextFieldStatus } from '../text-field/text-field';
import { Button } from '../button/button';

const SignUpForm = () => {
  const [formData, setFormData] = useState<UserSignUpData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await userController.signUp(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <TextField
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre"
            label="Nombre"
            status={error ? TextFieldStatus.error : TextFieldStatus.default}
          />
        </div>

        <div>
          <TextField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            label="Email"
            status={error ? TextFieldStatus.error : TextFieldStatus.default}
          />
        </div>

        <div>
          <TextField
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            label="Contraseña"
            status={error ? TextFieldStatus.error : TextFieldStatus.default}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>
    </div>
  );
}

export { SignUpForm };
