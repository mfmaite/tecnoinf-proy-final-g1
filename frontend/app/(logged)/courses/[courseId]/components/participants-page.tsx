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

type Props = { courseId: string }

function ParticipantsTable({ courseId }: Props) {
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null)
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ParticipantsTable;
