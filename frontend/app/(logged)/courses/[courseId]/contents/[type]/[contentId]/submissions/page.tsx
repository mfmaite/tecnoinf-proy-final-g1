'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { contentController } from '@/controllers/contentController';
import type { EvaluationSubmission } from '@/types/evaluation-submission';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { quizController } from '@/controllers/quizzControler';
import type { QuizSubmission } from '@/types/quiz-submission';

type Params = { params: { courseId: string; type: 'simpleContent' | 'evaluation' | 'quiz'; contentId: string } };

export default function SubmissionsPage({ params }: Params) {
  const { accessToken, user } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<
    { id: number; question: string; answers: { id: number; text: string; correct: boolean }[] }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!accessToken) return;
      try {
        if (params.type === 'evaluation') {
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
        } else if (params.type === 'quiz') {
          // cargar preguntas del quiz y submissions
          const [contentResp, subsResp] = await Promise.all([
            contentController.getContentByType(params.courseId, params.type, params.contentId, accessToken),
            quizController.getSubmissions(params.contentId, accessToken),
          ]);
          if (!active) return;
          if (contentResp.success && contentResp.data) {
            setQuizQuestions(contentResp.data.questions || []);
          } else {
            setError(contentResp.message ?? 'No se pudo cargar el quiz');
          }
          if (subsResp.success && subsResp.data) {
            setQuizSubmissions(subsResp.data);
          } else {
            setError(subsResp.message ?? 'No se pudieron cargar las entregas del quiz');
          }
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
        <h1 className="text-2xl font-bold text-secondary-color-70">
          Entregas ({params.type === 'quiz' ? quizSubmissions.length : submissions.length})
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {params.type === 'evaluation' && submissions.map((s) => (
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
            )}
          </div>
        ))}

        {params.type === 'quiz' && quizSubmissions.map((s) => (
          <div key={s.id} className="p-4 bg-white rounded-md border-surface-light-40 border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Estudiante:</span> {s.author?.name} ({s.author?.ci})
              </p>
              <p className="text-sm">
                <span className="font-bold">Nota:</span> {s.note ?? 0}
              </p>
            </div>
            <div className="text-sm text-text-neutral-50">
              {quizQuestions.map((q) => {
                const selected = (q.answers || []).find(a => s.answerIds.includes(a.id));
                const correct = (q.answers || []).find(a => a.correct);
                return (
                  <div key={q.id} className="mt-1">
                    <p className="font-semibold">{q.question}</p>
                    <p>
                      <span className="font-medium">Respuesta del alumno:</span>{' '}
                      <span className={selected?.id === correct?.id ? 'text-green-700' : 'text-red-700'}>
                        {selected?.text ?? 'Sin selección'}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Respuesta correcta:</span>{' '}
                      <span className="text-green-700">{correct?.text ?? '—'}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


