import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { courseController } from '@/controllers/courseController'

type Params = { params: { courseId: string } }

type ApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

type CourseDto = {
  id: string
  name: string
  createdDate: string
}

type ContentDto = {
  id: number
  title: string
  content: string | null
  fileName: string | null
  fileUrl: string | null
  createdDate: string
}

type CourseViewData = {
  course: CourseDto
  contents: ContentDto[]
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function isVideo(url?: string | null) {
  if (!url) return false
  return /(\.mp4|\.webm|\.ogg)(\?|#|$)/i.test(url)
}

function isImage(url?: string | null) {
  if (!url) return false
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.avif|\.svg)(\?|#|$)/i.test(url)
}

export default async function CourseView({ params }: Params) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken as string | undefined

  if (!accessToken) {
    redirect('/login')
  }

  const payload = (await courseController.getCourseById(params.courseId, accessToken!)) as ApiResponse<CourseViewData>
  const data = payload.data

  if (!payload.success || !data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el curso</h1>
        <p className="text-sm text-red-600">{payload.message ?? 'Error desconocido'}</p>
      </div>
    )
  }

  const { course, contents } = data

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-sm text-gray-500">ID: {course.id} · Creado: {formatDate(course.createdDate)}</p>
      </div>

      <div className="space-y-4">
        {contents?.length ? (
          contents.map((c) => (
            <div key={c.id} className="rounded-md border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{c.title}</h2>
                <span className="text-xs text-gray-500">{formatDate(c.createdDate)}</span>
              </div>

              {c.content ? (
                <div className="prose max-w-none whitespace-pre-wrap">{c.content}</div>
              ) : null}

              {c.fileUrl ? (
                <div className="space-y-2">
                  {isVideo(c.fileUrl) ? (
                    <video controls className="w-full max-h-[480px] rounded-md" src={c.fileUrl} />
                  ) : isImage(c.fileUrl) ? (
                    <img className="w-full rounded-md" src={c.fileUrl} alt={c.fileName ?? 'Archivo'} />
                  ) : (
                    <a className="text-blue-600 underline" href={c.fileUrl} target="_blank" rel="noreferrer">
                      {c.fileName ?? 'Ver archivo'}
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Este curso aún no tiene contenidos.</p>
        )}
      </div>
    </div>
  )
}
