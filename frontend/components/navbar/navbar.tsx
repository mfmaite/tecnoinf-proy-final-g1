'use client';

import Link from 'next/link';
import Image from 'next/image';

import { Dropdown } from './dropdown';
import { useAuth } from '@/hooks/useAuth';
import { UserInfo } from '@/components/auth/user-info';
import { LogoutButton } from '@/components/auth/logout-button';

export function Navbar() {
  const { user } = useAuth();

  const userDropdownItems = [
    { href: '/admin/users', label: 'Listado', adminOnly: true },
    { href: '/admin/users/new', label: 'Crear', adminOnly: true },
  ];

  const courseDropdownItems = [
    { href: '/admin/courses', label: 'Listado', adminOnly: true },
    { href: '/admin/courses/new', label: 'Crear', adminOnly: true },
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
                userRole={user?.role}
              />
              <Dropdown
                label="Cursos"
                items={courseDropdownItems}
                userRole={user?.role}
              />
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
