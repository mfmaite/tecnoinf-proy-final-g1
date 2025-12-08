'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { courseController } from '@/controllers/courseController';
import { Button } from '@/components/button/button';
import type { UserResponse } from '@/types/user';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { UserTableSelectable } from './components/user-table-selectable';
import { SelectionToolbar } from './components/selection-toolbar';

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
  const [bulkCreatedCount, setBulkCreatedCount] = useState<number | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[] | null>(null);

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
      setBulkCreatedCount(null);
      setBulkErrors(null);
      const cis = Object.keys(selected).filter(ci => selected[ci]);
      if (!cis.length && !csvFile) {
        setError('Seleccione al menos un estudiante');
        return;
      }
      let anySuccess = false;
      let messages: string[] = [];

      if (csvFile) {
        const resCsv = await courseController.addParticipantsCsv(params.courseId, csvFile, accessToken!);
        const createdCount = resCsv.data?.matriculados?.length ?? 0;
        const errs = resCsv.data?.errors ?? [];
        setBulkCreatedCount(createdCount);
        setBulkErrors(errs);
        if (createdCount > 0) {
          anySuccess = true;
          messages.push(`CSV: ${createdCount} matriculado(s)`);
        }
        if (errs.length > 0) {
          messages.push(`CSV errores: ${errs.length}`);
        }
        if (!createdCount && errs.length === 0 && !resCsv.success) {
          setError(resCsv.message ?? 'No se pudo procesar el CSV');
        }
      }

      if (cis.length > 0) {
        const res = await courseController.addParticipants(params.courseId, cis, accessToken!);
        if (res.success) {
          anySuccess = true;
          messages.push(`Manual: ${cis.length} matriculado(s)`);
        } else {
          setError(res.message ?? 'Error al matricular selección');
        }
      }

      if (anySuccess) {
        setSuccess(messages.join(' • '));
      }

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

      <SelectionToolbar
        query={query}
        onQueryChange={setQuery}
        showCsv
        onCsvChange={setCsvFile}
      />

      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      {success && (
        <div className="rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{success}</div>
      )}
      {bulkCreatedCount !== null && (
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Usuarios matriculados por CSV:</span> {bulkCreatedCount}
        </div>
      )}
      {bulkErrors && bulkErrors.length > 0 && (
        <div className="text-sm text-accent-danger-50 border border-accent-danger-40 bg-accent-danger-10 rounded-lg p-3">
          <div className="font-semibold mb-1">Errores CSV:</div>
          <ul className="list-disc ml-5 space-y-1">
            {bulkErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <UserTableSelectable users={filtered} selected={selected} onToggle={toggle} />
    </div>
  );
}


