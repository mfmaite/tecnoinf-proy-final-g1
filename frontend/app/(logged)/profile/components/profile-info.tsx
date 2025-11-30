import React from 'react';
import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import RoleLabel from '@/components/role-label/role-label';
import { UserResponse } from '@/types/user';

interface ProfileInfoProps {
  user: UserResponse | undefined;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
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
  );
}


