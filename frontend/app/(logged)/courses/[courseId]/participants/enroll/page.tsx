'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { courseController } from '@/controllers/courseController';
import { TextField } from '@/components/text-field/text-field';
import { Button } from '@/components/button/button';
import type { UserResponse } from '@/types/user';
import { ChevronDown } from '@/public/assets/icons/chevron-down';

type Params = { params: { courseId: string } }

export default function EnrollStudentsPage({ params }: Params) {
  const { accessToken } = useAuth();

  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!accessToken) return;
      const res = await courseController.getNonParticipants(params.courseId, accessToken);
      if (!res.success || !res.data) {
        setError(res.message ?? 'No se pudieron cargar los estudiantes');
        return;
      }
      setAllUsers(res.data);
    };
    load();
  }, [accessToken, params.courseId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      u.ci.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [allUsers, query]);

  const toggle = (ci: string) => setSelected(prev => ({ ...prev, [ci]: !prev[ci] }));

  const enroll = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      const cis = Object.keys(selected).filter(ci => selected[ci]);
      if (!cis.length && !csvFile) {
        setError('Seleccione al menos un estudiante');
        return;
      }
      const res = await courseController.addParticipants(params.courseId, cis, accessToken!);
      if (!res.success) {
        setError(res.message ?? 'Error al matricular');
        return;
      }
      setSuccess('Estudiantes matriculados correctamente');
      // refrescar lista (los agregados ya no deberían mostrarse)
      const reload = await courseController.getNonParticipants(params.courseId, accessToken!);
      if (reload.success && reload.data) {
        setAllUsers(reload.data);
        setSelected({});
      }
      setCsvFile(null);
    } finally {
      setSubmitting(false);
    }
  };

  const canEnroll = useMemo(() => {
    const anySelected = Object.values(selected).some(Boolean);
    return anySelected || !!csvFile;
  }, [selected, csvFile]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/courses/${params.courseId}/participants`} className="text-secondary-color-70">
            <ChevronDown className="w-6 h-6 rotate-90" />
          </Link>
          <h1 className="text-4xl font-bold text-secondary-color-70">Matricular estudiantes</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={enroll} disabled={submitting || !canEnroll}>
            {submitting ? 'Matriculando...' : 'Matricular'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TextField
          name="search"
          placeholder="Buscar por nombre, email o documento"
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex items-center gap-3 bg-surface-light-10 border border-surface-light-50 rounded-md p-2">
          <input
            type="file"
            accept=".csv"
            className="text-sm text-text-neutral-50"
            onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      {success && (
        <div className="rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{success}</div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(u => (
              <tr key={u.ci}>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!selected[u.ci]}
                    onChange={() => toggle(u.ci)}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.ci}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


