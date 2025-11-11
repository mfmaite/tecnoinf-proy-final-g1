'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { courseController } from '@/controllers/courseController';
import type { CourseContent, CourseViewData } from '@/types/content';
import { ContentDetail } from '../../components/content-detail';
import { Button } from '@/components/button/button';
import Link from 'next/link';

type Params = { params: { courseId: string; contentId: string } };

export default function ContentDetailPage({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<CourseViewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        const payload = await courseController.getCourseById(params.courseId, accessToken);
        if (!active) return;
        if (!payload.success || !payload.data) {
          setError(payload.message ?? 'No se pudo cargar el contenido');
        } else {
          setData(payload.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { active = false };
  }, [accessToken, params.courseId]);

  const content: CourseContent | undefined = useMemo(() => {
    const idNum = Number(params.contentId);
    return data?.contents.find((c: any) => Number(c.id) === idNum);
  }, [data, params.contentId]);

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
      </div>
    );
  }

  if (!content || !data) {
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
      <div className="flex items-center justify-between">
        <Link href={`/courses/${params.courseId}`} className="text-secondary-color-70 hover:text-secondary-color-50 underline">
          ← Volver al curso
        </Link>
        <div />
      </div>
      <ContentDetail content={content} />
    </div>
  );
}


