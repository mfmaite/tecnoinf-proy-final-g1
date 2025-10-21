'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { Button } from '@/components/button/button';
import { courseController } from '@/controllers/courseController';
import { userController } from '@/controllers/userController';

export interface CourseFormData {
  id: string;
  name: string;
  professorsCis: string[];
}

const initialFormData: CourseFormData = {
  id: '',
  name: '',
  professorsCis: [],
}

interface Professor {
  ci: string;
  name: string;
}

const CreateCourseForm = () => {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const loadProfessors = async () => {
      try {
        const professorsData = await userController.getUsers(accessToken!, "profesores");
        setProfessors(professorsData);
      } catch (err) {
        console.error('Error al cargar profesores:', err);
      } finally {
        setIsLoadingProfessors(false);
      }
    };

    if (accessToken) {
      loadProfessors();
    }
  }, [accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProfessorChange = (professorCi: string) => {
    setFormData(prev => {
      const isSelected = prev.professorsCis.includes(professorCi);
      const newProfessorsCis = isSelected
        ? prev.professorsCis.filter(ci => ci !== professorCi)
        : [...prev.professorsCis, professorCi];

      return {
        ...prev,
        professorsCis: newProfessorsCis,
      };
    });

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.id.trim()) {
      setError('El ID del curso es requerido');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre del curso es requerido');
      return;
    }

    if (formData.professorsCis.length === 0) {
      setError('Debe seleccionar al menos un profesor');
      return;
    }

    setIsLoading(true);

    try {
      const result = await courseController.createCourse(formData, accessToken!);

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

  return (
    <div>
      <div className="w-full flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-surface-light-10 rounded-2xl shadow-lg p-8 border-4 border-surface-dark-70">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-bold text-secondary-color-70 mb-2">
              Crear Curso
            </h1>

            <p className="text-gray-600 text-center">
              Complete los datos para crear un nuevo curso en el sistema
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
                label="ID del Curso"
                name="id"
                type="text"
                placeholder="Ej: MAT101, FIS201"
                value={formData.id}
                onChange={handleChange}
                disabled={isLoading}
                status={error && !formData.id ? TextFieldStatus.error : TextFieldStatus.default}
                maxLength={10}
              />

              <TextField
                label="Nombre del Curso"
                name="name"
                type="text"
                placeholder="Ingresa el nombre del curso"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                status={error && !formData.name ? TextFieldStatus.error : TextFieldStatus.default}
              />
            </div>

            <div>
              <label className="block text-small mb-1 font-bold text-text-neutral-50">
                Profesores *
              </label>

              {isLoadingProfessors ? (
                <div className="text-gray-500 text-sm">Cargando profesores...</div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {professors.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-4">
                      No hay profesores disponibles
                    </div>
                  ) : (
                    professors.map((professor) => (
                      <label
                        key={professor.ci}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.professorsCis.includes(professor.ci)}
                          onChange={() => handleProfessorChange(professor.ci)}
                          disabled={isLoading}
                          className="w-4 h-4 text-primary-color-80 border-gray-300 rounded focus:ring-primary-color-80 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">
                          {professor.name} ({professor.ci})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Selecciona uno o más profesores para el curso
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                size="lg"
                color="secondary"
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="lg"
                color="primary"
                variant="filled"
                className="flex-1"
                disabled={isLoading || isLoadingProfessors}
              >
                {isLoading ? 'Creando curso...' : 'Crear Curso'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseForm;
