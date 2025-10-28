'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';
import { userController } from '@/controllers/userController';
import { SelectField } from '@/components/select-field/select-field';
import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import Link from 'next/link';
import { UserResponse } from '@/types/user';
import RoleLabel from '@/components/role-label/role-label';

interface User {
  ci: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE';
  description?: string;
  pictureUrl?: string;
}

type SortOrder = 'name_asc' | 'name_desc' | 'ci_asc' | 'ci_desc';
type RoleFilter = 'todos' | 'profesores' | 'estudiantes' | 'administradores';

const UsersListPage = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('todos');
  const [sortOrder, setSortOrder] = useState<SortOrder>('name_asc');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await userController.getUsers(accessToken!, roleFilter, sortOrder);
        setUsers(usersData.data ?? []);
        setFilteredUsers(usersData.data ?? []);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar usuarios');
      }
    };

    if (accessToken) {
      loadUsers();
    }
  }, [accessToken, roleFilter, sortOrder]);

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ci.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSort = (order: SortOrder) => {
    setSortOrder(order);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border-4 border-surface-dark-70">

          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-secondary-color-70 mb-2">
              Lista de Usuarios
            </h1>
            <p className="text-gray-600">
              Gestiona todos los usuarios del sistema
            </p>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Buscar"
                name="search"
                type="text"
                placeholder="Nombre, email o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                status={TextFieldStatus.default}
              />

              <div>
                <SelectField
                  label="Filtrar por Rol"
                  name="roleFilter"
                  value={roleFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value as RoleFilter)}
                  options={[{ value: 'todos', label: 'Todos los roles' }, { value: 'administradores', label: 'Administradores' }, { value: 'profesores', label: 'Profesores' }, { value: 'estudiantes', label: 'Estudiantes' }]}
                />
              </div>

              <div>
                <SelectField
                  label="Ordenar por"
                  name="sortOrder"
                  value={sortOrder}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as SortOrder)}
                  options={[{ value: 'name_asc', label: 'Nombre (A-Z)' }, { value: 'name_desc', label: 'Nombre (Z-A)' }, { value: 'ci_asc', label: 'Cédula (A-Z)' }, { value: 'ci_desc', label: 'Cédula (Z-A)' }]}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4">
              <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(sortOrder === 'ci_asc' ? 'ci_desc' : 'ci_asc')}
                  >
                    Cédula
                    {(sortOrder === 'ci_asc' || sortOrder === 'ci_desc') && (
                      <span className="ml-1">
                        {sortOrder === 'ci_asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm
                        ? 'No se encontraron usuarios con los filtros aplicados'
                        : 'No hay usuarios registrados'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.ci} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserProfilePicture
                              name={user.name}
                              pictureUrl={user.pictureUrl}
                              size="md"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.ci}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleLabel role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {user.description || '-'}
                        </div>
                      </td>
                      <td>
                        <Link href={`/users/${user.ci}`} className="text-primary-color-80 hover:text-primary-color-90 font-medium">
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </div>
              <div className="flex space-x-4">
                <span>Admin: {users.filter(u => u.role === 'ADMIN').length}</span>
                <span>Profesores: {users.filter(u => u.role === 'PROFESOR').length}</span>
                <span>Estudiantes: {users.filter(u => u.role === 'ESTUDIANTE').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;
