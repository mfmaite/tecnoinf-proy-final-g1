"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { courseController } from '@/controllers/courseController';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { UserResponse } from '@/types/user';
import { SendIcon } from '@/public/assets/icons/send-icon';
import { chatController } from '@/controllers/chatController';
import Modal from '@/components/modal/modal';
import { Button } from '@/components/button/button';
import { TextField, TextFieldStatus } from '@/components/text-field/text-field';

type Props = { courseId: string }

function ParticipantsTable({ courseId }: Props) {
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null)
  const [gradeOpen, setGradeOpen] = useState<boolean>(false);
  const [gradeSubmitting, setGradeSubmitting] = useState<boolean>(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeSuccess, setGradeSuccess] = useState<string | null>(null);
  const [selectedCi, setSelectedCi] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [gradeValue, setGradeValue] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const getParticipants = async () => {
    const res = await courseController.getParticipants(courseId, accessToken!)

      if (!res.success || !res.data) {
        setError(res.message ?? 'Error desconocido')
      } else {
        setData(res.data)
      }
    }

    getParticipants();
  }, [accessToken, courseId])

  const onOpenChat = async (participantCi: string) => {
    if (!accessToken) return;
    try {
      const res = await chatController.getChats(accessToken);
      const chats = res.data ?? [];
      const matches = chats.filter(c => c.participant1?.ci === participantCi || c.participant2?.ci === participantCi);
      if (matches.length > 0) {
        // si hay varios, tomar el más reciente por id
        const targetId = matches.reduce((acc, c) => (c.id > acc ? c.id : acc), matches[0].id);
        router.push(`/chats/${targetId}`);
      } else {
        router.push(`/chats/new?recipientCi=${participantCi}`);
      }
    } catch {
      // en caso de error, redirigir a nuevo chat igualmente
      router.push(`/chats/new?recipientCi=${participantCi}`);
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudieron cargar los participantes</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Cargando participantes...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/courses/${courseId}`} className="text-secondary-color-70">
            <ChevronDown className="w-6 h-6 rotate-90" />
          </Link>
          <h1 className="text-4xl font-bold text-secondary-color-70">
            Participantes
          </h1>
        </div>
        {user?.role === 'PROFESOR' && (
          <div className='flex items-center gap-3'>
            <Link
              href={`/courses/${courseId}/participants/unenroll`}
              className="text-sm text-secondary-color-70 hover:text-secondary-color-50 underline"
            >
              Desmatricular
            </Link>

            <Link
              href={`/courses/${courseId}/participants/enroll`}
              className="text-sm text-secondary-color-70 hover:text-secondary-color-50 underline"
            >
              Matricular
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((u: any) => (
              <tr key={u.ci}>
                <td className="px-4 py-3 text-sm text-gray-700">{u.ci}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <Link href={`/profile/${u.ci}`} className="text-secondary-color-70 hover:text-secondary-color-50 underline">{u.name}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.role}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button
                    type="button"
                    onClick={() => onOpenChat(u.ci)}
                    className="text-primary-color-80 hover:text-primary-color-90 font-medium"
                    title="Enviar mensaje"
                  >
                    <SendIcon className="w-6 h-6" />
                  </button>
                  {user?.role === 'PROFESOR' && u.role === 'ESTUDIANTE' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCi(u.ci);
                        setSelectedName(u.name);
                        setGradeValue('');
                        setGradeError(null);
                        setGradeSuccess(null);
                        setGradeOpen(true);
                      }}
                      className="ml-3 px-3 py-1.5 rounded-md border bg-secondary-color-70 text-white hover:bg-secondary-color-80"
                      title="Publicar calificación final"
                    >
                      Calificar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={gradeOpen}
        onClose={() => {
          if (!gradeSubmitting) {
            setGradeOpen(false);
            setGradeError(null);
            setGradeSuccess(null);
            setGradeValue('');
          }
        }}
        title="Publicar calificación final"
        description={selectedName ? `Estudiante: ${selectedName} (${selectedCi})` : undefined}
        footer={(
          <Button
            onClick={async () => {
              if (!accessToken || !selectedCi) return;
              const val = Number(gradeValue);
              if (!Number.isInteger(val) || val < 1 || val > 12) {
                setGradeError('La nota debe ser un número entero entre 1 y 12');
                return;
              }
              setGradeSubmitting(true);
              setGradeError(null);
              setGradeSuccess(null);
              const res = await courseController.publishFinalGrade(courseId, selectedCi, val, accessToken);
              setGradeSubmitting(false);
              if (res.success) {
                setGradeSuccess('Calificación publicada correctamente');
                setTimeout(() => {
                  setGradeOpen(false);
                  setGradeSuccess(null);
                  setGradeValue('');
                }, 1000);
              } else {
                setGradeError(res.message || 'No se pudo publicar la calificación');
              }
            }}
            disabled={gradeSubmitting || !accessToken}
          >
            {gradeSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        )}
      >
        <div className="flex flex-col gap-4">
          <TextField
            name="final-grade"
            label="Nota (1-12)"
            type="number"
            value={gradeValue}
            onChange={(e) => setGradeValue(e.target.value)}
            helperText={gradeError || undefined}
            status={gradeError ? TextFieldStatus.error : TextFieldStatus.default}
          />
          {(gradeSuccess) && (
            <div className="text-accent-success-40">{gradeSuccess}</div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ParticipantsTable;
