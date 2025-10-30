'use client'
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import UserProfilePicture from '../user-profile-picture/user-profile-picture';

export function UserInfo() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.ci}</p>
      </div>

      <Link href={'/profile'}>
        <UserProfilePicture
          name={user.name}
          pictureUrl={user.pictureUrl}
          size="md"
        />
      </Link>
    </div>
  )
}
