'use client';

import Link from 'next/link';
import Image from 'next/image';

import { Dropdown } from './dropdown';
import { useAuth } from '@/hooks/useAuth';
import { UserInfo } from '@/components/auth/user-info';

export function Navbar() {
  const { user } = useAuth();

  const userDropdownItems = [
    { href: '/admin/users', label: 'Listado', userRole: ['ADMIN'] },
    { href: '/admin/users/new', label: 'Crear', userRole: ['ADMIN'] },
  ];

  const courseDropdownItems = [
    { href: '/courses', label: 'Listado', userRole: ['ADMIN', 'PROFESOR', 'ESTUDIANTE'] },
    { href: '/admin/courses/new', label: 'Crear', userRole: ['ADMIN'] },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <Image src="/assets/images/logo-mentora.png" alt="Logo Mentora" width={45} height={45} />
            </Link>

            <div className="flex space-x-4">
              <Dropdown
                label="Usuarios"
                items={userDropdownItems}
                loggedUserRole={user?.role}
              />
              <Dropdown
                label="Cursos"
                items={courseDropdownItems}
                loggedUserRole={user?.role}
              />

              {user?.role !== 'ADMIN' && (
                  <Link
                    href="/chats"
                    className="text-gray-600 hover:text-primary-color-80 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    Mensajes
                  </Link>
              )}

              {user?.role === 'ESTUDIANTE' && (
                  <Link
                    href="/notifications"
                    className="text-gray-600 hover:text-primary-color-80 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    Notificaciones
                  </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserInfo />
          </div>
        </div>
      </div>
    </nav>
  );
}
