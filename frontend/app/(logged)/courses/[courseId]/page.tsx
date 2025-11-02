'use client';

import React from 'react';

import { courseController } from '@/controllers/courseController';
import { formatDate } from "@/helpers/utils";
import { ContentCard } from './components/content-card';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseViewData } from '@/types/content';
import { AnnouncementForumIcon } from '@/public/assets/icons/announcement-forum-icon';
import { ConsultForumIcon } from '@/public/assets/icons/consult-forum-icon';

type Params = { params: { courseId: string } }

export default function CourseView({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CourseViewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!accessToken) return;
      const payload = await courseController.getCourseById(params.courseId, accessToken);
      if (!active) return;
      if (!payload.success || !payload.data) {
        setError(payload.message ?? 'Error desconocido');
      } else {
        setData(payload.data);
      }
    };
    load();
    return () => { active = false };
  }, [accessToken, params.courseId]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el curso</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Cargando curso...</p>
      </div>
    );
  }

  const { course, contents, forums } = data
  const announcementsForum = forums?.find(f => f.type === 'ANNOUNCEMENTS');
  const consultsForum = forums?.find(f => f.type === 'CONSULTS');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-secondary-color-70">{course.name}</h1>
          <p className="text-sm text-gray-500">Creado: {formatDate(course.createdDate)}</p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 border border-neutral-200">
            ID: {course.id}
          </span>

          <Link
            href={`/courses/${params.courseId}/participants`}
            className="text-sm text-secondary-color-70 hover:text-secondary-color-50 underline"
          >
            Participantes
          </Link>
        </div>

      </div>

      <div className="flex items-center gap-6">
        {announcementsForum && (
          <Link
            href={`/courses/${params.courseId}/forums/${announcementsForum.id}`}
            className="inline-flex items-center gap-2 text-secondary-color-70 hover:text-secondary-color-50"
          >
            <AnnouncementForumIcon width={18} height={18} />
            <span>Foro de Anuncios</span>
          </Link>
        )}

        {consultsForum && (
          <Link
            href={`/courses/${params.courseId}/forums/${consultsForum.id}`}
            className="inline-flex items-center gap-2 text-secondary-color-70 hover:text-secondary-color-50"
          >
            <ConsultForumIcon width={18} height={18} />
            <span>Foro de Consultas</span>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {contents?.length ? (
          contents.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 text-gray-500">
            Este curso aún no tiene contenidos.
          </div>
        )}
      </div>
    </div>
  )
}
