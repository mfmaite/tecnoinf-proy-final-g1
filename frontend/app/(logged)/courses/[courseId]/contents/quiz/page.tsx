'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/button/button';
import { quizController } from '@/controllers/quizzControler';
import type { CreateQuizRequest } from '@/types/quiz';

type Params = { params: { courseId: string } }

const MAX_TITLE = 255;

type AnswerForm = { text: string; correct: boolean };
type QuestionForm = { question: string; answers: AnswerForm[] };

export default function CreateQuizPage({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string>(''); // "YYYY-MM-DDTHH:mm"
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: '', answers: [{ text: '', correct: false }, { text: '', correct: false }] }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const titleError = useMemo(() => {
    if (!title.trim()) return 'El título es obligatorio';
    if (title.length > MAX_TITLE) return `Máximo ${MAX_TITLE} caracteres`;
    return null;
  }, [title]);

  const dueDateError = useMemo(() => {
    if (!dueDate) return 'La fecha límite es obligatoria';
    return null;
  }, [dueDate]);

  const questionsError = useMemo(() => {
    if (questions.length === 0) return 'Debe haber al menos una pregunta';
    for (const q of questions) {
      if (!q.question.trim()) return 'Cada pregunta debe tener texto';
      if (!q.answers || q.answers.length < 2) return 'Cada pregunta debe tener al menos dos respuestas';
      const hasCorrect = q.answers.some(a => a.correct === true);
      if (!hasCorrect) return 'Cada pregunta debe tener al menos una respuesta correcta';
      for (const a of q.answers) {
        if (!a.text.trim()) return 'Las respuestas no pueden estar vacías';
      }
    }
    return null;
  }, [questions]);

  const isValid = !titleError && !dueDateError && !questionsError;

  const normalizeDueDate = (value: string) => {
    if (value && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    }
    return value;
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question: '', answers: [{ text: '', correct: false }, { text: '', correct: false }] }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, question: text } : q));
  };

  const addAnswer = (qIdx: number) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, answers: [...q.answers, { text: '', correct: false }] } : q));
  };

  const removeAnswer = (qIdx: number, aIdx: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const next = q.answers.filter((_, ai) => ai !== aIdx);
      return { ...q, answers: next };
    }));
  };

  const updateAnswerText = (qIdx: number, aIdx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const next = q.answers.map((a, ai) => ai === aIdx ? { ...a, text } : a);
      return { ...q, answers: next };
    }));
  };

  const toggleAnswerCorrect = (qIdx: number, aIdx: number, correct: boolean) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const next = q.answers.map((a, ai) => ai === aIdx ? { ...a, correct } : a);
      return { ...q, answers: next };
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessToken) return;
    if (!isValid) return;
    setSubmitting(true);

    try {
      const payload: CreateQuizRequest = {
        title: title.trim(),
        dueDate: normalizeDueDate(dueDate),
        questions: questions.map(q => ({
          question: q.question.trim(),
          answers: q.answers.map(a => ({ text: a.text.trim(), correct: a.correct }))
        }))
      };

      const resp = await quizController.createQuiz(params.courseId, payload, accessToken);
      if (resp.success) {
        router.push(`/courses/${params.courseId}?createdQuiz=1`);
      } else {
        setError(resp.message || 'No se pudo crear el quiz');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-color-70">Nuevo quiz</h1>
        <p className="text-sm text-gray-500">Curso: {params.courseId}</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800 mb-4">{error}</div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Título del quiz</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-color-20 text-text-neutral-50"
            placeholder="Ingrese un título"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Máximo {MAX_TITLE} caracteres</span>
            <span className="text-xs text-gray-500">{title.length}/{MAX_TITLE}</span>
          </div>
          {titleError ? <p className="text-xs text-red-600">{titleError}</p> : null}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha límite</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-color-20 text-text-neutral-50"
          />
          {dueDateError ? <p className="text-xs text-red-600">{dueDateError}</p> : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Preguntas</label>
            <Button type="button" color="secondary" variant="filled" onClick={addQuestion}>
              Agregar pregunta
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder={`Pregunta #${qIdx + 1}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-color-20 text-text-neutral-50"
                  />
                </div>
                <Button type="button" variant="outline" color="secondary" onClick={() => removeQuestion(qIdx)}>
                  Eliminar
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Respuestas (mínimo 2, al menos una correcta)</span>
                  <Button type="button" variant="outline" color="secondary" onClick={() => addAnswer(qIdx)}>
                    Agregar respuesta
                  </Button>
                </div>
                {q.answers.map((a, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={a.text}
                      onChange={(e) => updateAnswerText(qIdx, aIdx, e.target.value)}
                      placeholder={`Respuesta #${aIdx + 1}`}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-color-20 text-text-neutral-50"
                    />
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={a.correct}
                        onChange={(e) => toggleAnswerCorrect(qIdx, aIdx, e.target.checked)}
                        className="h-4 w-4 text-secondary-color-70 border-gray-300 rounded"
                      />
                      Correcta
                    </label>
                    <Button type="button" variant="outline" color="secondary" onClick={() => removeAnswer(qIdx, aIdx)}>
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {questionsError ? <p className="text-xs text-red-600">{questionsError}</p> : null}
        </div>

        <div className="flex items-center gap-3 w-full justify-end">
          <Button type="button" variant="outline" color="secondary" onClick={() => router.push(`/courses/${params.courseId}`)}>
            Cancelar
          </Button>
          <Button type="submit" color="secondary" disabled={!isValid || submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}


