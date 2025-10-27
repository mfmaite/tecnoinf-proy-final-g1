'use client'

import { useAuth } from '../../hooks/useAuth'
import { Button } from '../button/button'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const { logout, isLoading } = useAuth()

  return (
    <Button
      onClick={logout}
      disabled={isLoading}
      className={className}
      variant="outline"
      color="secondary"
    >
      {children || 'Cerrar Sesión'}
    </Button>
  )
}
