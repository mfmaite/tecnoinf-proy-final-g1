'use client'

import { useEffect, useMemo, useState } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'
import { Navbar } from '@/components/navbar/navbar'
import { useAuth } from '@/hooks/useAuth'
import { userController } from '@/controllers/userController'
import { courseController } from '@/controllers/courseController'
import type { UserActivity } from '@/types/activity'
import type { Course } from '@/types/course'
import type { PendingEvaluationsAndQuizzes } from '@/types/pending'
import Link from 'next/link'

export default function Dashboard() {
  const { accessToken } = useAuth()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [pending, setPending] = useState<PendingEvaluationsAndQuizzes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!accessToken) return
      setLoading(true)
      setError(null)
      try {
        const [actResp, crsResp, pendResp] = await Promise.all([
          userController.getUserActivities(accessToken),
          courseController.getCourses(accessToken),
          userController.getPending(accessToken),
        ])
        if (!cancelled) {
          if (actResp.success && actResp.data) setActivities(actResp.data)
          if (crsResp.success && crsResp.data) setCourses(crsResp.data)
          if (pendResp.success && pendResp.data) setPending(pendResp.data)
        }
      } catch (e) {
        if (!cancelled) setError('No se pudo cargar la información del inicio')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [accessToken])

  const latestActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 3)
  }, [activities])

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Inicio</h1>
              <div className="flex items-center space-x-4">
                <LogoutButton />
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800 mb-6">{error}</div>
            ) : null}

            {loading ? (
              <p className="text-gray-500">Cargando...</p>
            ) : (
              <div className="space-y-10">
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Últimas actividades</h2>
                  {latestActivities.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay actividades recientes.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 border rounded-lg">
                      {latestActivities.map((a) => (
                        <li key={a.id} className="p-3 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">{a.description ?? a.type}</p>
                            <p className="text-xs text-gray-400">{new Date(a.createdDate).toLocaleString()}</p>
                          </div>
                          <Link className="text-secondary-color-70 text-sm hover:underline" href={a.link}>Ver</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Cursos activos</h2>
                    <Link className="text-secondary-color-70 text-sm hover:underline" href="/courses">Ver todos</Link>
                  </div>
                  {courses.length === 0 ? (
                    <p className="text-sm text-gray-500">No estás inscripto en cursos.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((c) => (
                        <Link key={c.id} href={`/courses/${c.id}`} className="block rounded-lg border hover:shadow p-4">
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-400 mt-1">Creado: {new Date(c.createdDate).toLocaleDateString()}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Pendientes</h2>
                  {!pending || (pending.evaluations.length === 0 && pending.quizzes.length === 0) ? (
                    <p className="text-sm text-gray-500">No hay evaluaciones o quizzes pendientes.</p>
                  ) : (
                    <div className="space-y-6">
                      {pending.evaluations.length > 0 ? (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Evaluaciones</h3>
                          <ul className="divide-y divide-gray-100 border rounded-lg">
                            {pending.evaluations.map(ev => (
                              <li key={ev.id} className="p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-800">{ev.title}</p>
                                  <p className="text-xs text-gray-500">Vence: {ev.dueDate ? new Date(ev.dueDate).toLocaleString() : 'Sin fecha'}</p>
                                </div>
                                <Link className="text-secondary-color-70 text-sm hover:underline" href={`/courses/${ev.courseId}/contents/evaluation/${ev.id}`}>Ir</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {pending.quizzes.length > 0 ? (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Quizzes</h3>
                          <ul className="divide-y divide-gray-100 border rounded-lg">
                            {pending.quizzes.map(q => (
                              <li key={q.id} className="p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-800">{q.title}</p>
                                  <p className="text-xs text-gray-500">Vence: {q.dueDate ? new Date(q.dueDate).toLocaleString() : 'Sin fecha'}</p>
                                </div>
                                <Link className="text-secondary-color-70 text-sm hover:underline" href={`/courses/${q.courseId}/contents/quiz/${q.id}`}>Ir</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
