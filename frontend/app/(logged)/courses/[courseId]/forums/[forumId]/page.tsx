"use client";

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { forumController } from '@/controllers/forumController'
import type { ForumPageData, ForumPost } from '@/types/forum'
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { PostCard } from './components/post-card';

type Params = { params: { courseId: string; forumId: string } }

const ForumsPage = ({ params }: Params) => {
  const { accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ForumPageData | null>(null);
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
      const resp = await forumController.getForumById(params.forumId, accessToken);
      if (!active) return;
      if (!resp.success || !resp.data) {
        setError(resp.message ?? 'Error desconocido');
      } else {
        setData(resp.data);
      }
    };

    load();
    return () => { active = false };
  }, [accessToken, params.forumId]);

  const forumTitle = useMemo(() => {
    if (!data) return '';
    return data.forum.type === 'ANNOUNCEMENTS' ? 'Foro de Anuncios' : 'Foro de Consultas';
  }, [data]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el foro</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Cargando foro...</p>
      </div>
    );
  }

  const { posts } = data;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href={`/courses/${params.courseId}`} className="text-secondary-color-70">
          <ChevronDown className="w-6 h-6 rotate-90" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-secondary-color-70">{forumTitle}</h1>
          <p className="text-sm text-gray-500">Curso: {params.courseId}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-gray-500">No hay posts en este foro.</div>
        ) : (
          posts.map((post: ForumPost) => (
            <PostCard key={post.id} post={post} courseId={params.courseId} forumId={params.forumId} />
          ))
        )}
      </div>
    </div>
  )
}

export default ForumsPage;
