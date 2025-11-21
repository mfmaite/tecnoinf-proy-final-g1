'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { forumController } from '@/controllers/forumController';
import type { ForumPostPageData } from '@/types/forum';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { PostComposer } from '../../components/post-composer';
import { PostItem } from '../../components/post-item';

type Params = { params: { courseId: string; forumId: string; postId: string } }

export default function ForumPostPage({ params }: Params) {
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<ForumPostPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isConsultsForum, setIsConsultsForum] = useState(false);

  const getPost = async() => {
    if (!accessToken) return;
    const resp = await forumController.getPostById(params.postId, accessToken);

    if (!resp.success || !resp.data) {
      setError(resp.message ?? 'Error desconocido');
    } else {
      setData(resp.data);
      setIsAuthor(resp.data.post.authorCi === user?.ci);
      setIsConsultsForum(resp.data.forum.type === 'CONSULTS');
    }
  };

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
    getPost();
  }

  useEffect(() => {
    getPost();
  }, [accessToken]);

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

  const { forum, post, responses } = data as NonNullable<typeof data>;

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

      <PostItem
        authorName={post.authorName}
        authorPictureUrl={post.authorPictureUrl}
        createdDate={post.createdDate}
        message={post.message}
        onReply={isConsultsForum ? () => setReplyOpen(true) : undefined}
        onEdit={isAuthor ? () => { /* editar: futuro */ } : undefined}
        onDelete={isAuthor ? () => { /* eliminar: futuro */ } : undefined}
      />

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

      {responses?.length && (
        <div className="space-y-4 pl-10">
          {responses.map((r) => (
            <PostItem
              key={r.id}
              authorName={r.authorName}
              authorPictureUrl={r.authorPictureUrl ?? null}
              createdDate={r.createdDate}
              message={r.message}
              onEdit={r.authorCi === user?.ci ? () => { /* editar: futuro */ } : undefined}
              onDelete={r.authorCi === user?.ci ? () => { /* eliminar: futuro */ } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}


