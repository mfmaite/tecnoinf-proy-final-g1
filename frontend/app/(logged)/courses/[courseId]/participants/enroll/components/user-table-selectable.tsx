'use client';

import React from 'react';
import type { UserResponse } from '@/types/user';

type Props = {
  users: UserResponse[];
  selected: Record<string, boolean>;
  onToggle: (ci: string) => void;
  isDesmatricular?: boolean;
};

export const UserTableSelectable = ({ users, selected, onToggle, isDesmatricular = false }: Props) => {
  if (!users.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-4">
        <div className="text-center text-gray-500">No hay estudiantes para {isDesmatricular ? 'desmatricular' : 'matricular'}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((u) => (
            <tr key={u.ci}>
              <td className="px-4 py-3 text-sm text-gray-700">
                <input type="checkbox" checked={!!selected[u.ci]} onChange={() => onToggle(u.ci)} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{u.ci}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{u.name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


