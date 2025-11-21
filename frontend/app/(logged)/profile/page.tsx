'use client';

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/button/button';
import { LogoutButton } from '@/components/auth/logout-button';
import { ChangePasswordModal } from './components/change-password-modal';
import { ProfileHeader } from './components/profile-header';
import { ProfileInfo } from './components/profile-info';
import { ActivitySection } from './components/activity-section';

const ProfilePage = () => {
  const { user, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <ProfileHeader
            title="Mi Perfil"
            onOpenChangePassword={() => setIsOpen(true)}
            showChangePassword
            rightActions={
              <Button variant="outline" color="secondary" disabled>
                Editar
              </Button>
            }
          />

          <ProfileInfo user={user ?? undefined} />

          <ActivitySection accessToken={accessToken} />

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
