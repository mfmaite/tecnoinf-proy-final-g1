'use client'

import { UserInfo } from '@/components/auth/user-info'
import { LogoutButton } from '@/components/auth/logout-button'
import { Navbar } from '@/components/navbar/navbar'

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                ¡Bienvenido! Has iniciado sesión correctamente.
              </p>
              <p className="text-sm text-gray-500">
                Esta es una página protegida que solo pueden ver usuarios autenticados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
