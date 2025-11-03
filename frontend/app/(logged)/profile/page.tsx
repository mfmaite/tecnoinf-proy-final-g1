'use client';

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/button/button';
import RoleLabel from '@/components/role-label/role-label';
import { LogoutButton } from '@/components/auth/logout-button';
import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { ChangePasswordModal } from './components/change-password-modal';

const ProfilePage = () => {
  const { user, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-secondary-color-70">Mi Perfil</h1>
            <div className="flex gap-2">
              <Button variant="outline" color="secondary" disabled>
                Editar
              </Button>
              <Button onClick={() => setIsOpen(true)}>
                Cambiar contraseña
              </Button>
            </div>
          </div>

          <div className="p-6 flex items-start gap-6 border-b border-gray-200">
            <UserProfilePicture
              name={user?.name ?? ''}
              pictureUrl={user?.pictureUrl}
              size="3xl"
              className="flex-shrink-0"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-base text-secondary-color-70 font-medium">{user?.name ?? '-'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">CI</p>
                <p className="text-base text-secondary-color-70 font-medium">{user?.ci ?? '-'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-base text-secondary-color-70 font-medium break-all">{user?.email ?? '-'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Rol</p>
                <RoleLabel role={user?.role ?? '-'} />
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Descripción</p>
                <p className="text-base text-secondary-color-70">{user?.description ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex items-start gap-6 border-b border-gray-200">
            <LogoutButton />
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        accessToken={accessToken || ''}
      />
    </div>
  );
}

export default ProfilePage;
