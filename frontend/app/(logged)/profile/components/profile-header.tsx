import React from 'react';
import { Button } from '@/components/button/button';

interface ProfileHeaderProps {
  title: string;
  onOpenChangePassword?: () => void;
  showChangePassword?: boolean;
  rightActions?: React.ReactNode;
}

export function ProfileHeader({
  title,
  onOpenChangePassword,
  showChangePassword = false,
  rightActions,
}: ProfileHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-secondary-color-70">{title}</h1>
      <div className="flex gap-2">
        {rightActions}
        {showChangePassword && (
          <Button onClick={onOpenChangePassword}>
            Cambiar contraseña
          </Button>
        )}
      </div>
    </div>
  );
}


