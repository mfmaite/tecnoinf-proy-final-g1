'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { courseController } from '@/controllers/courseController';
import type { UserResponse } from '@/types/user';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { SelectionToolbar } from '../enroll/components/selection-toolbar';
import { UserTableSelectable } from '../enroll/components/user-table-selectable';
import { Button } from '@/components/button/button';

type Params = { params: { courseId: string } }

export default function UnenrollStudentsPage({ params }: Params) {
  const { accessToken } = useAuth();

  const [participants, setParticipants] = useState<UserResponse[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    if (!accessToken) return;
    const res = await courseController.getParticipants(params.courseId, accessToken);
    if (!res.success || !res.data) {
      setError(res.message ?? 'No se pudieron cargar los participantes');
      return;
    }
    setParticipants(res.data);
  };

  useEffect(() => {
    load();
  }, [accessToken, params.courseId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(u =>
      u.ci.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [participants, query]);

  const toggle = (ci: string) => setSelected(prev => ({ ...prev, [ci]: !prev[ci] }));

  const unenroll = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      const cis = Object.keys(selected).filter(ci => selected[ci]);
      if (!cis.length) {
        setError('Seleccione al menos un estudiante');
        return;
      }
      const res = await courseController.deleteParticipants(params.courseId, cis, accessToken!);
      if (!res.success) {
        setError(res.message ?? 'Error al desmatricular');
        return;
      }
      setSuccess('Estudiantes desmatriculados correctamente');
      await load();
      setSelected({});
    } finally {
      setSubmitting(false);
    }
  };

  const canUnenroll = useMemo(() => {
    const anySelected = Object.values(selected).some(Boolean);
    return anySelected;
  }, [selected]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/courses/${params.courseId}/participants`} className="text-secondary-color-70">
            <ChevronDown className="w-6 h-6 rotate-90" />
          </Link>
          <h1 className="text-4xl font-bold text-secondary-color-70">Desmatricular estudiantes</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={unenroll} disabled={submitting || !canUnenroll}>
            {submitting ? 'Desmatriculando...' : 'Desmatricular'}
          </Button>
        </div>
      </div>

      <SelectionToolbar
        query={query}
        onQueryChange={setQuery}
        showCsv
      />

      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      {success && (
        <div className="rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{success}</div>
      )}

      <UserTableSelectable users={filtered} selected={selected} onToggle={toggle} isDesmatricular />
    </div>
  );
}


