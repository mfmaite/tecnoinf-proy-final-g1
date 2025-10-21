'use client'
import Image from 'next/image';
import { useAuth } from '../../hooks/useAuth';

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

      <Image
        src={user.pictureUrl || "/assets/images/default-user.png"}
        alt={user.name}
        className="w-8 h-8 rounded-full"
        width={45}
        height={45}
      />
    </div>
  )
}
