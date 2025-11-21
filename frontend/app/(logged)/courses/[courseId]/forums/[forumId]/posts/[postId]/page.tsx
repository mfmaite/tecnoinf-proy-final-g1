'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { forumController } from '@/controllers/forumController';
import type { ForumPostPageData } from '@/types/forum';
import { ChevronDown } from '@/public/assets/icons/chevron-down';
import { PostComposer } from '../../components/post-composer';
import { PostItem } from '../../components/post-item';
import { useRouter } from 'next/navigation';

type Params = { params: { courseId: string; forumId: string; postId: string } }

export default function ForumPostPage({ params }: Params) {
  const { accessToken, user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<ForumPostPageData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isConsultsForum, setIsConsultsForum] = useState(false);

  const getPost = async() => {
    if (!accessToken) return;
    const resp = await forumController.getPostById(params.postId, accessToken);

    if (!resp.success || !resp.data) {
      setErrorMessage(resp.message ?? 'Error desconocido');
    } else {
      setData(resp.data);
      setIsAuthor(resp.data.post.authorCi === user?.ci);
      setIsConsultsForum(resp.data.forum.type === 'CONSULTS');
    }
  };

  const onReply = async () => {
    if (!accessToken) return;
    setErrorMessage(null);
    setReplySubmitting(true);
    const resp = await forumController.createPostResponse(params.postId, replyMessage, accessToken);

    if (!resp.success) {
      setErrorMessage(resp.message ?? 'No se pudo responder el post');
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

  const onEditPost = async (newMessage: string) => {
    if (!accessToken) return;
    setErrorMessage(null);
    const resp = await forumController.updatePost(params.postId, newMessage, accessToken);

    if (!resp.success) {
      setErrorMessage(resp.message ?? 'No se pudo actualizar el post');
    } else {
      await getPost();
    }
  }

  const onDeletePost = async () => {
    if (!accessToken) return;
    const resp = await forumController.deletePost(params.postId, accessToken);
    if (!resp.success) {
      setErrorMessage(resp.message ?? 'No se pudo eliminar el post');
    } else {
      router.push(`/courses/${params.courseId}/forums/${params.forumId}`);
    }
  }

  const onEditResponse = async (responseId: number, newMessage: string) => {
    if (!accessToken) return;
    setErrorMessage(null);
    const resp = await forumController.updatePostResponse(params.postId, responseId, newMessage, accessToken);
    if (!resp.success) {
      setErrorMessage(resp.message ?? 'No se pudo actualizar la respuesta');
    } else {
      await getPost();
    }
  }

  const onDeleteResponse = async (responseId: number) => {
    if (!accessToken) return;
    const resp = await forumController.deletePostResponse(params.postId, responseId, accessToken);
    if (!resp.success) {
      setErrorMessage(resp.message ?? 'No se pudo eliminar la respuesta');
    } else {
      await getPost();
    }
  }

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!accessToken) return;
      const resp = await forumController.getPostById(params.postId, accessToken);
      if (!active) return;
      if (!resp.success || !resp.data) {
        setErrorMessage(resp.message ?? 'Error desconocido');
      } else {
        setData(resp.data);
      }
    };
    load();
    return () => { active = false };
  }, [accessToken, params.postId]);

  if (errorMessage) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">No se pudo cargar el post</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
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

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: &nbsp;</strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <PostItem
        authorName={post.authorName}
        authorPictureUrl={post.authorPictureUrl}
        createdDate={post.createdDate}
        initialMessage={post.message}
        onReply={isConsultsForum ? () => setReplyOpen(true) : undefined}
        onDelete={isAuthor ? onDeletePost : undefined}
        onEdit={isAuthor ? (newMessage: string) => onEditPost(newMessage) : undefined}
      />

      {replyOpen && (
        <PostComposer
          message={replyMessage}
          setMessage={setReplyMessage}
          onSubmit={() => onReply()}
          onCancel={() => {
            setReplyOpen(false);
            setErrorMessage(null);
          }}
          submitting={replySubmitting}
          error={errorMessage}
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
              initialMessage={r.message}
              onEdit={r.authorCi === user?.ci ? (newMessage: string) => onEditResponse(r.id, newMessage) : undefined}
              onDelete={r.authorCi === user?.ci ? () => onDeleteResponse(r.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

