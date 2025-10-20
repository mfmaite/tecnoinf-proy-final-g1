'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from '@/components/auth/logout-button';
import { UserInfo } from '@/components/auth/user-info';
import Link from 'next/link';

export function AdminNavbar() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-secondary-color-70">
              Panel Admin
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-primary-color-80 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Usuarios
              </Link>
              <Link
                href="/admin/users/new"
                className="text-gray-600 hover:text-primary-color-80 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Crear Usuario
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserInfo />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
