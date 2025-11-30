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
import { quizController } from '@/controllers/quizzControler';
import type { QuizSubmission } from '@/types/quiz-submission';

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
  const [quizQuestions, setQuizQuestions] = useState<
    { id: number; question: string; answers: { id: number; text: string; correct: boolean }[] }[]
  >([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [myQuizSubmission, setMyQuizSubmission] = useState<QuizSubmission | null>(null);
  const [quizSubmitError, setQuizSubmitError] = useState<string | null>(null);
  const [quizSubmitSuccess, setQuizSubmitSuccess] = useState<string | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState<boolean>(false);

  const selectQuizAnswer = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

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
          if (params.type === 'evaluation') {
            setContent(resp.data.evaluation as CourseContent);
            setSubmissions(resp.data.submissions as EvaluationSubmission[]);
          } else if (params.type === 'quiz') {
            setContent(resp.data.quiz as CourseContent);
            setQuizQuestions(resp.data.questions || []);
            // cargar mi submission de quiz si existe
            const mySub = await quizController.getMySubmission(params.contentId, accessToken);
            if (mySub.success) {
              const subData = (mySub.data ?? null) as QuizSubmission | null;
              setMyQuizSubmission(subData);
              if (subData && Array.isArray(subData.answerIds) && subData.answerIds.length > 0) {
                // precargar selección
                const byQuestion: Record<number, number | null> = {};
                for (const q of resp.data.questions || []) {
                  const match = (q.answers || []).find((a: any) => subData.answerIds.includes(a.id));
                  byQuestion[q.id] = match?.id ?? null;
                }
                setSelectedAnswers(byQuestion);
              }
            }
          } else {
            setContent(resp.data as CourseContent);
          }
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
            {content.type === 'evaluation' && user?.role === 'ESTUDIANTE' ? (
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
            {content.type === 'quiz' && user?.role === 'ESTUDIANTE' ? (
              (() => {
                const due = (content as any).dueDate as string | null;
                const isOverdue = due ? new Date(due) < new Date() : false;
                const hasSubmission = !!myQuizSubmission;
                return !isOverdue && !hasSubmission ? (
                  <button
                    className="px-4 py-2 rounded-md bg-secondary-color-70 text-white hover:opacity-90 transition"
                    onClick={async () => {
                      // no abre modal, el quiz está en la misma página
                      // solo mostramos botón de enviar más abajo
                      const el = document.getElementById('quiz-form');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Completar y enviar
                  </button>
                ) : null;
              })()
            ) : null}
            {content.type === 'quiz' && user?.role === 'PROFESOR' ? (
              <Link
                href={`/courses/${params.courseId}/contents/${params.type}/${params.contentId}/submissions`}
                className="px-4 py-2 rounded-md bg-secondary-color-70 text-white hover:opacity-90 transition"
              >
                Ver respuestas de estudiantes
              </Link>
            ) : null}
          </div>
        </div>

        {(content.type === 'evaluation' || content.type === 'quiz') && (content as any).dueDate ? (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Vence: {formatDate((content as any).dueDate)}
            </p>
          </div>
        ) : null}
      </div>

      {content.type === 'evaluation' && submissions && submissions.length > 0 ? (
        user?.role === 'ESTUDIANTE' ? (
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

      {content.type === 'simpleContent' ? (
        <ContentDetail content={content} />
      ) : null}

      {content.type === 'quiz' ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-6 text-text-neutral-50">
          {quizQuestions.length === 0 ? (
            <p className="text-sm text-gray-500">Este quiz no tiene preguntas.</p>
          ) : (
            quizQuestions.map((q, idx) => (
              <div key={q.id ?? idx} className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary-color-10 text-secondary-color-70 text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <h2 className="text-lg font-semibold text-secondary-color-70">{q.question}</h2>
                </div>
                <div className="space-y-2 pl-8">
                  {(q.answers ?? []).map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`quiz-q-${q.id}`}
                        className="h-4 w-4 text-secondary-color-70 border-gray-300"
                        checked={selectedAnswers[q.id] === a.id}
                        onChange={() => selectQuizAnswer(q.id, a.id)}
                        disabled={!!myQuizSubmission || user?.role === 'PROFESOR'}
                      />
                      <span>
                        {a.text}
                        {user?.role === 'PROFESOR' && a.correct ? ' (correcta)' : ''}
                        {user?.role === 'ESTUDIANTE' && myQuizSubmission && a.correct ? ' (correcta)' : ''}
                        {user?.role === 'ESTUDIANTE' && myQuizSubmission && selectedAnswers[q.id] === a.id && !a.correct ? ' (tu respuesta)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          {user?.role === 'ESTUDIANTE' ? (
            <div id="quiz-form" className="pt-2">
              {quizSubmitError ? <p className="text-sm text-red-600">{quizSubmitError}</p> : null}
              {quizSubmitSuccess ? <p className="text-sm text-green-600">{quizSubmitSuccess}</p> : null}
              {!myQuizSubmission ? (
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-md bg-secondary-color-70 text-white disabled:opacity-60"
                    disabled={quizSubmitting || !accessToken}
                    onClick={async () => {
                      if (!content || content.type !== 'quiz' || !accessToken) return;
                      setQuizSubmitting(true);
                      setQuizSubmitError(null);
                      setQuizSubmitSuccess(null);
                      try {
                        const answers = Object.values(selectedAnswers).filter((v): v is number => typeof v === 'number');
                        if (answers.length === 0) {
                          setQuizSubmitError('Seleccioná al menos una respuesta.');
                          return;
                        }
                        const resp = await quizController.createSubmission(content.id, answers, accessToken);
                        if (resp.success && resp.data) {
                          setQuizSubmitSuccess('Entrega enviada correctamente.');
                          setMyQuizSubmission(resp.data);
                        } else {
                          setQuizSubmitError(resp.message ?? 'No se pudo enviar la entrega.');
                        }
                      } finally {
                        setQuizSubmitting(false);
                      }
                    }}
                  >
                    {quizSubmitting ? 'Enviando...' : 'Enviar entrega'}
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-md border">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Nota:</span> {myQuizSubmission.note ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Se muestran tus respuestas seleccionadas y las correctas en verde.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}


