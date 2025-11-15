'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { userController } from '@/controllers/userController';
import { ProfileHeader } from '../components/profile-header';
import { ProfileInfo } from '../components/profile-info';
import { UserResponse } from '@/types/user';

const OtherUserProfilePage = () => {
  const params = useParams<{ ci: string }>();
  const { accessToken } = useAuth();
  const [user, setUser] = useState<UserResponse | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken || !params?.ci) return;
      setLoading(true);
      setError(null);
      const res = await userController.getProfile(accessToken, params.ci);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setError(res.message ?? 'No se pudo cargar el perfil');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [accessToken, params?.ci]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <ProfileHeader
            title={user?.name ? `Perfil de ${user.name}` : 'Perfil de usuario'}
          />

          {error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : loading ? (
            <div className="p-6 text-secondary-color-70">Cargando...</div>
          ) : (
            <ProfileInfo user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfilePage;


