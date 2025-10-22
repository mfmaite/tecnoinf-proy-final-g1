import React from 'react';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { courseController } from '@/controllers/courseController';
import { formatDate } from "@/helpers/utils";
import { ContentCard } from './components/content-card';

type Params = { params: { courseId: string } }

export default async function CourseView({ params }: Params) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken as string | undefined

  if (!accessToken) {
    redirect('/login')
  }

  const payload = await courseController.getCourseById(params.courseId, accessToken!);
  const { data, message, success } = payload;

  if (!success || !data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el curso</h1>
        <p className="text-sm text-red-600">{message ?? 'Error desconocido'}</p>
      </div>
    )
  }

  const { course, contents } = data

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-secondary-color-70">{course.name}</h1>
          <p className="text-sm text-gray-500">Creado: {formatDate(course.createdDate)}</p>
        </div>

        <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 border border-neutral-200">
          ID: {course.id}
        </span>
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
