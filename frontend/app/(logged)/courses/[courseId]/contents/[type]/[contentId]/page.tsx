'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { contentController } from '@/controllers/contentController';
import type { CourseContent } from '@/types/content';
import { ContentDetail } from '../../../components/content-detail';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { ContentTypeFlag } from '../../../components/content-type-flag';
import { formatDate } from '@/helpers/utils';
import { evaluationController } from '@/controllers/evaluationController';
import type { EvaluationSubmission } from '@/types/evaluation-submission';
import { EvaluationSubmissionCard } from '../../../components/evaluation-submission-card';

type Params = { params: { courseId: string; type: 'simpleContent' | 'evaluation' | 'quiz'; contentId: string } };

export default function ContentDetailPage({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState<CourseContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSubmission, setShowSubmission] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [solution, setSolution] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
        if (resp.success && resp.data) {
          setContent(resp.data.evaluation as CourseContent);
          setSubmissions(resp.data.submissions as EvaluationSubmission[]);
        } else {
          setError(resp.message ?? 'No se pudo cargar el contenido');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { active = false };
  }, [accessToken, params.courseId, params.type, params.contentId]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Cargando contenido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el contenido</h1>
        <p className="text-sm text-red-600">{error}</p>
        <div className="mt-4">
          <Link href={`/courses/${params.courseId}`} className="text-secondary-color-70 underline">Volver al curso</Link>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Contenido no encontrado.</p>
        <div className="mt-4">
          <Link href={`/courses/${params.courseId}`} className="text-secondary-color-70 underline">Volver al curso</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href={`/courses/${params.courseId}`} className="text-secondary-color-70">
              <ChevronDown className="w-6 h-6 rotate-90" />
            </Link>
            <h1 className="text-4xl font-bold text-secondary-color-70">{content.title}</h1>
            <ContentTypeFlag type={content.type} />
          </div>

          <div>
            {content.type === 'evaluation' ? (
              (() => {
                const due = (content as any).dueDate as string | null;
                const isOverdue = due ? new Date(due) < new Date() : false;
                const hasAnySubmission = submissions && submissions.length > 0;
                return !isOverdue && !hasAnySubmission ? (
                  <button
                    className="px-4 py-2 rounded-md bg-secondary-color-70 text-white hover:opacity-90 transition"
                    onClick={() => setShowSubmission((v) => !v)}
                  >
                    {showSubmission ? 'Cerrar entrega' : 'Agregar entrega'}
                  </button>
                ) : null;
              })()
            ) : null}
          </div>
        </div>

        {content.type === 'evaluation' && content.dueDate ? (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Vence: {formatDate(content.dueDate)}
            </p>
          </div>
        ) : null}
      </div>

      {content.type === 'evaluation' && submissions && submissions.length > 0 ? (
        submissions.length === 1 ? (
          <EvaluationSubmissionCard submission={submissions[0]} />
        ) : (
          <div className="p-4 border rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">Hay {submissions.length} entregas.</p>
              <Link
                href={`/courses/${params.courseId}/contents/${params.type}/${params.contentId}/submissions`}
                className="text-secondary-color-70 underline"
              >
                Ver entregas
              </Link>
            </div>
          </div>
        )
      ) : null}

      {content.type === 'evaluation' && showSubmission ? (
        <div className="p-4 border rounded-md space-y-3">
          <h2 className="text-lg font-semibold text-secondary-color-70">Tu entrega</h2>
          <p className="text-sm text-gray-600">Podés adjuntar un archivo, escribir una solución en texto, o ambas.</p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Archivo</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary-color-10 file:text-secondary-color-70 hover:file:bg-secondary-color-20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Solución en texto</label>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={5}
              className="w-full border rounded-md p-2 text-sm text-text-neutral-50"
              placeholder="Escribí tu solución aquí..."
            />
          </div>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
          {submitSuccess ? <p className="text-sm text-green-600">{submitSuccess}</p> : null}

          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-md bg-secondary-color-70 text-white disabled:opacity-60"
              disabled={
                submitting ||
                (!file && (!solution || solution.trim().length === 0)) ||
                !accessToken
              }
              onClick={async () => {
                if (!content || content.type !== 'evaluation' || !accessToken) return;
                setSubmitting(true);
                setSubmitError(null);
                setSubmitSuccess(null);
                try {
                  const form = new FormData();
                  if (file) form.append('file', file);
                  if (solution && solution.trim().length > 0) form.append('solution', solution.trim());
                  const resp = await evaluationController.createSubmission(
                    content.id,
                    form,
                    accessToken
                  );
                  if (resp.success) {
                    setSubmitSuccess('Entrega enviada correctamente.');
                    setShowSubmission(false);
                    setSolution('');
                    setFile(null);
                  } else {
                    setSubmitError(resp.message ?? 'No se pudo enviar la entrega.');
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? 'Enviando...' : 'Enviar entrega'}
            </button>
            <button
              className="px-4 py-2 rounded-md border text-text-neutral-50"
              onClick={() => {
                setShowSubmission(false);
                setSubmitError(null);
                setSubmitSuccess(null);
                setSolution('');
                setFile(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <ContentDetail content={content} />
    </div>
  );
}


