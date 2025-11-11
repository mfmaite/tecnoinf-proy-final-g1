'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { contentController } from '@/controllers/contentController';
import type { CourseContent } from '@/types/content';
import { ContentDetail } from '../../../components/content-detail';
import { ChevronDown } from '@/public/assets/icons/chevron-down';

type Params = { params: { courseId: string; type: 'simpleContent' | 'evaluation' | 'quiz'; contentId: string } };

export default function ContentDetailPage({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState<CourseContent | null>(null);
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
        const resp = await contentController.getContentByType(
          params.courseId,
          params.type,
          params.contentId,
          accessToken
        );
        if (!active) return;
        if (resp.success && resp.data) {
          setContent(resp.data as CourseContent);
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
      <div className="flex items-center gap-2">
        <Link href={`/courses/${params.courseId}`} className="text-secondary-color-70">
          <ChevronDown className="w-6 h-6 rotate-90" />
        </Link>
        <h1 className="text-4xl font-bold text-secondary-color-70">{content.title}</h1>
      </div>

      <ContentDetail content={content} />
    </div>
  );
}


