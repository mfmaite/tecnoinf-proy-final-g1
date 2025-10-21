'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { courseController } from '@/controllers/courseController';
import { SelectField } from '@/components/select-field/select-field';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  createdDate: string;
}

type SortOrder = 'name_asc' | 'name_desc' | 'id_asc' | 'id_desc';

const CoursesListPage = () => {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('name_asc');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const coursesData = await courseController.getCourses(accessToken!);
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar cursos');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      loadCourses();
    }
  }, [accessToken]);

  useEffect(() => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const handleSort = (order: SortOrder) => {
    setSortOrder(order);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Cargando cursos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border-4 border-surface-dark-70">

          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-secondary-color-70 mb-2">
              Lista de Cursos
            </h1>
            <p className="text-gray-600">
              Gestiona todos los cursos del sistema
            </p>
          </div>

          {/* Filtros */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Buscar"
                name="search"
                type="text"
                placeholder="Nombre o ID del curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                status={TextFieldStatus.default}
              />

              <SelectField
                label="Ordenar por"
                name="sortOrder"
                value={sortOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as SortOrder)}
                options={[
                  { value: 'name_asc', label: 'Nombre (A-Z)' },
                  { value: 'name_desc', label: 'Nombre (Z-A)' },
                  { value: 'id_asc', label: 'ID (A-Z)' },
                  { value: 'id_desc', label: 'ID (Z-A)' }
                ]}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 py-4">
              <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(sortOrder === 'name_asc' ? 'name_desc' : 'name_asc')}
                  >
                    Nombre
                    {(sortOrder === 'name_asc' || sortOrder === 'name_desc') && (
                      <span className="ml-1">
                        {sortOrder === 'name_asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(sortOrder === 'id_asc' ? 'id_desc' : 'id_asc')}
                  >
                    ID
                    {(sortOrder === 'id_asc' || sortOrder === 'id_desc') && (
                      <span className="ml-1">
                        {sortOrder === 'id_asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm
                        ? 'No se encontraron cursos con los filtros aplicados'
                        : 'No hay cursos registrados'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {course.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {course.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(course.createdDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <Link href={`/courses/${course.id}`} className="text-primary-color-80 hover:text-primary-color-90 font-medium">
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer con estadísticas */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Mostrando {filteredCourses.length} de {courses.length} cursos
              </div>
              <div className="flex space-x-4">
                <span>Total de cursos: {courses.length}</span>
                <span>Cursos creados hoy: {courses.filter(c => {
                  const today = new Date();
                  const courseDate = new Date(c.createdDate);
                  return courseDate.toDateString() === today.toDateString();
                }).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesListPage;
