'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { forumController } from '@/controllers/forumController';
import type { ForumPostPageData } from '@/types/forum';
import { formatDate } from '@/helpers/utils';
import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { Button } from '@/components/button/button';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { PostComposer } from '../../components/post-composer';

type Params = { params: { courseId: string; forumId: string; postId: string } }

export default function ForumPostPage({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ForumPostPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const onReply = async () => {
    if (!accessToken) return;
    setReplyError(null);
    setReplySubmitting(true);
    const resp = await forumController.createPostResponse(params.postId, replyMessage, accessToken);
    if (!resp.success) {
      setReplyError(resp.message ?? 'No se pudo responder el post');
    } else {
      const refreshed = await forumController.getPostById(params.postId, accessToken);
      if (refreshed.success && refreshed.data) {
        setData(refreshed.data);
      }
      setReplyOpen(false);
    }
    setReplySubmitting(false);
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!accessToken) return;
      const resp = await forumController.getPostById(params.postId, accessToken);
      if (!active) return;
      if (!resp.success || !resp.data) {
        setError(resp.message ?? 'Error desconocido');
      } else {
        setData(resp.data);
      }
    };
    load();
    return () => { active = false };
  }, [accessToken, params.postId]);

  const isConsultsForum = useMemo(() => data?.forum.type === 'CONSULTS', [data]);
  const isAuthor = useMemo(() => !!(user && data && user.ci === data.post.authorCi), [user, data]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el post</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Cargando post...</p>
      </div>
    );
  }

  const { forum, post } = data;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href={`/courses/${params.courseId}/forums/${params.forumId}`} className="text-secondary-color-70">
          <ChevronDown className="w-6 h-6 rotate-90" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-secondary-color-70">{forum.type === 'ANNOUNCEMENTS' ? 'Anuncio' : 'Consulta'}</h1>
          <p className="text-sm text-gray-500">Curso: {params.courseId}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-start gap-4">
          <UserProfilePicture name={post.authorName} pictureUrl={post.authorPictureUrl ?? undefined} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <div className="text-sm font-semibold text-gray-800 truncate">{post.authorName}</div>
                <div className="text-xs text-gray-500">{formatDate(post.createdDate)}</div>
              </div>
              <div className="flex items-center gap-2">
                {isConsultsForum && (
                  <Button size="sm" variant="outline" color="secondary" onClick={() => setReplyOpen(true)}>
                    Responder
                  </Button>
                )}
                {isAuthor && (
                  <>
                    <Button size="sm" variant="outline" color="secondary" onClick={() => { /* editar: futuro */ }}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" color="secondary" onClick={() => { /* eliminar: futuro */ }}>
                      Eliminar
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 whitespace-pre-wrap text-text-neutral-50">{post.message}</div>
          </div>
        </div>
      </div>

      {replyOpen && (
        <PostComposer
          message={replyMessage}
          setMessage={setReplyMessage}
          onSubmit={() => onReply()}
          onCancel={() => {
            setReplyOpen(false);
            setReplyError(null);
          }}
          submitting={replySubmitting}
          error={replyError}
          placeholder="Escribe tu respuesta..."
          submitLabel="Responder"
        />
      )}
    </div>
  );
}


