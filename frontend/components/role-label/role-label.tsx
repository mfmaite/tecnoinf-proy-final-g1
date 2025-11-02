import React from 'react'

const RoleLabel = ({
  role,
}: {
  role: string;
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'PROFESOR':
        return 'bg-blue-100 text-blue-800';
      case 'ESTUDIANTE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'PROFESOR':
        return 'Profesor';
      case 'ESTUDIANTE':
        return 'Estudiante';
      default:
        return role;
    }
  };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(role)}`}>
      {getRoleLabel(role)}
    </span>
  )
}

export default RoleLabel
