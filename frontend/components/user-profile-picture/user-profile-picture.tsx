'use client';

import React, { useMemo } from 'react';

interface UserProfilePictureProps {
  name: string;
  pictureUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

const UserProfilePicture: React.FC<UserProfilePictureProps> = ({
  name,
  pictureUrl,
  size = 'md',
  className = '',
}) => {
  const colorPalette = [
    'bg-primary-color-80 text-white',
    'bg-secondary-color-70 text-white',
    'bg-accent-success-50 text-white',
    'bg-accent-info-50 text-white',
    'bg-accent-warning-50 text-white',
    'bg-accent-danger-50 text-white',
    'bg-surface-dark-50 text-white',
    'bg-blue-600 text-white',
    'bg-green-600 text-white',
    'bg-purple-600 text-white',
    'bg-pink-600 text-white',
    'bg-indigo-600 text-white',
    'bg-red-600 text-white',
    'bg-orange-600 text-white',
    'bg-teal-600 text-white',
    'bg-cyan-600 text-white',
    'bg-rose-600 text-white',
    'bg-emerald-600 text-white',
    'bg-violet-600 text-white',
    'bg-sky-600 text-white',
    'bg-fuchsia-600 text-white',
    'bg-slate-600 text-white',
    'bg-gray-600 text-white',
    'bg-zinc-600 text-white',
    'bg-neutral-600 text-white',
    'bg-stone-600 text-white',
    'bg-blue-700 text-white',
    'bg-green-700 text-white',
    'bg-purple-700 text-white',
    'bg-pink-700 text-white',
    'bg-indigo-700 text-white',
    'bg-red-700 text-white',
    'bg-orange-700 text-white',
    'bg-teal-700 text-white',
    'bg-cyan-700 text-white',
    'bg-rose-700 text-white',
    'bg-emerald-700 text-white',
    'bg-violet-700 text-white',
    'bg-sky-700 text-white',
    'bg-fuchsia-700 text-white',
    'bg-slate-700 text-white',
    'bg-gray-700 text-white',
    'bg-zinc-700 text-white',
    'bg-neutral-700 text-white',
    'bg-stone-700 text-white',
  ];

  const colorClass = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    const selectedColor = colorPalette[index];

    return selectedColor;
  }, [name]);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-2xl',
    '3xl': 'h-24 w-24 text-3xl',
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} ${className}`}>
      {pictureUrl ? (
        <img
          className={`${sizeClass} rounded-full object-cover`}
          src={pictureUrl}
          alt={name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="${sizeClass} rounded-full ${colorClass} flex items-center justify-center font-medium">
                  ${name.charAt(0).toUpperCase()}
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className={`${sizeClass} rounded-full ${colorClass} flex items-center justify-center font-medium`}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default UserProfilePicture;
