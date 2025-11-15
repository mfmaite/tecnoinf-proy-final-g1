'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { contentController } from '@/controllers/contentController';
import type { EvaluationSubmission } from '@/types/evaluation-submission';
import { ChevronDown } from '@/public/assets/icons/chevron-down';

type Params = { params: { courseId: string; type: 'simpleContent' | 'evaluation' | 'quiz'; contentId: string } };

export default function SubmissionsPage({ params }: Params) {
  const { accessToken, user } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!accessToken) return;
      try {
        const resp = await contentController.getContentByType(
          params.courseId,
          params.type,
          params.contentId,
          accessToken
        );
        if (!active) return;
        if (resp.success) {
          setSubmissions(resp.data.submissions as EvaluationSubmission[]);
        } else {
          setError(resp.message ?? 'No se pudieron cargar las entregas');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { active = false };
  }, [accessToken, params.courseId, params.type, params.contentId]);

  useEffect(() => {
    if (!loading && user && user.role !== 'PROFESOR') {
      router.push(`/courses/${params.courseId}/contents/${params.type}/${params.contentId}`);
    }
  }, [loading, user, params.courseId, params.type, params.contentId, router]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Cargando entregas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudieron cargar las entregas</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href={`/courses/${params.courseId}/contents/${params.type}/${params.contentId}`} className="text-secondary-color-70 underline">
          <ChevronDown className="w-6 h-6 rotate-90" />
        </Link>
        <h1 className="text-2xl font-bold text-secondary-color-70">Entregas ({submissions.length})</h1>
      </div>

      <div className="flex flex-col gap-4">
        {submissions.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between bg-white rounded-md border-surface-light-40 border">
            <div className="space-y-1 text-text-neutral-50">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Estudiante:</span> {s.author?.name} ({s.author?.ci})
              </p>

              {s.fileUrl && (
                <p className="text-sm">
                  <span className="font-bold">Archivo:</span> {' '}
                  <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-color-70 underline">
                    {s.fileName || 'Ver archivo'}
                  </a>
                </p>
              )}

              {s.solution && (
                <p className="text-sm">
                  <span className="font-bold">Contenido:</span> {s.solution}
                </p>
              )}

              {s.note != null && (
                <p className="text-sm">
                  <span className="font-bold">Nota:</span> {s.note}
                </p>
              )}
            </div>
            {user?.role === 'PROFESOR' && s.note == null && (
                <div>
                  <Link href={`/courses/${params.courseId}/contents/${params.type}/${params.contentId}/submissions/${s.id}/grade`} className="px-3 py-2 rounded-md border bg-secondary-color-70 text-white hover:bg-secondary-color-80">
                    Agregar nota
                  </Link>
                </div>
              )
            }
          </div>
        ))}
      </div>
    </div>
  );
}


