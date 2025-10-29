'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/button/button';
import { contentController } from '@/controllers/contentController';

const MDEditor = dynamic<any>(() => import('@uiw/react-md-editor').then(m => m.default), { ssr: false });

type Params = { params: { courseId: string } }

const MAX_TITLE = 255;
const MAX_FILE_BYTES = 250 * 1024 * 1024; // 250MB
const ACCEPT_EXTENSIONS = ['.txt', '.doc', '.docx', '.odt', '.pdf', '.jpg', '.jpeg', '.png', '.mp4', '.mov', '.avi', '.mp3', '.wav'];

export default function CreateSimpleContentPage({ params }: Params) {
  const { accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const titleError = useMemo(() => {
    if (!title.trim()) return 'El título es obligatorio';
    if (title.length > MAX_TITLE) return `Máximo ${MAX_TITLE} caracteres`;
    return null;
  }, [title]);

  const fileError = useMemo(() => {
    if (!file) return null;
    if (file.size > MAX_FILE_BYTES) return 'El archivo excede 250MB';
    const lower = file.name.toLowerCase();
    const ok = ACCEPT_EXTENSIONS.some(ext => lower.endsWith(ext));
    if (!ok) return 'Tipo de archivo no permitido';
    return null;
  }, [file]);

  const contentError = useMemo(() => {
    const hasMarkdown = !!markdown.trim();
    const hasFile = !!file;
    if (!hasMarkdown && !hasFile) return 'Debe proporcionar contenido o archivo';
    return null;
  }, [markdown, file]);

  const isValid = !titleError && !fileError && !contentError;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessToken) return;
    if (!isValid) return;
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', title.trim());
      if (markdown.trim()) form.append('content', markdown);
      if (file) form.append('file', file);
      const resp = await contentController.createSimpleContent(params.courseId, form, accessToken);
      if (resp.success) {
        router.push(`/courses/${params.courseId}?created=1`);
      } else {
        setError(resp.message || 'No se pudo crear el contenido');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-color-70">Nuevo contenido simple</h1>
        <p className="text-sm text-gray-500">Curso: {params.courseId}</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800 mb-4">{error}</div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Título del contenido</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-color-20 text-text-neutral-50"
            placeholder="Ingrese un título"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Máximo {MAX_TITLE} caracteres</span>
            <span className="text-xs text-gray-500">{title.length}/{MAX_TITLE}</span>
          </div>
          {titleError ? <p className="text-xs text-red-600">{titleError}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Archivo</label>
          <input
            type="file"
            accept={ACCEPT_EXTENSIONS.join(',')}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-secondary-color-50 file:px-4 file:py-2 file:text-white hover:file:bg-secondary-color-60 cursor-pointer"
          />
          <p className="text-xs text-gray-500">Tipos permitidos: {ACCEPT_EXTENSIONS.join(', ')}. Máx 250MB.</p>
          {fileError ? <p className="text-xs text-red-600">{fileError}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Contenido</label>
          <div data-color-mode="light" className="border border-gray-200 rounded-lg overflow-hidden">
            <MDEditor value={markdown} onChange={(v: string | undefined) => setMarkdown(v ?? '')} height={350} />
          </div>
          {contentError ? <p className="text-xs text-red-600">{contentError}</p> : null}
        </div>

        <div className="flex items-center gap-3 w-full justify-end">
          <Button type="button" variant="outline" color="secondary" onClick={() => router.push(`/courses/${params.courseId}`)}>
            Cancelar
          </Button>
          <Button type="submit" color="secondary" disabled={!isValid || submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}


