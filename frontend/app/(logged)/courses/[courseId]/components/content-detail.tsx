"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { formatDate, isImage, isVideo } from '@/helpers/utils';
import type { CourseContent } from '@/types/content';
import { Modal } from '@/components/modal/modal';

const MarkdownPreview = dynamic<any>(() => import('@uiw/react-markdown-preview').then(m => m.default), { ssr: false });

type ContentDetailProps = {
  content: CourseContent;
};

export function ContentDetail({ content }: ContentDetailProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileUrl = (content as any).fileUrl as string | null | undefined;
  const fileName = (content as any).fileName as string | null | undefined;
  const markdown = (content as any).content as string | null | undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4 text-text-neutral-50">
      {markdown ? (
        <div className="prose max-w-none" data-color-mode="light">
          <MarkdownPreview source={markdown} />
        </div>
      ) : null}

      {fileUrl ? (
        <div className="space-y-2">
          {isVideo(fileUrl) ? (
            <video controls className="w-full max-h-[480px] rounded-md" src={fileUrl} />
          ) : isImage(fileUrl) ? (
            <div className="w-full h-64 rounded-md bg-gray-50 flex items-center justify-center">
              <img
                className="max-h-full object-contain cursor-default hover:cursor-[zoom-in]"
                src={fileUrl}
                alt={fileName ?? 'Archivo'}
                onClick={() => { setPreviewUrl(fileUrl as string); setIsImageOpen(true); }}
              />
            </div>
          ) : (
            <a className="text-blue-600 underline" href={fileUrl} target="_blank" rel="noreferrer">
              Ver archivo
            </a>
          )}
        </div>
      ) : null}

      <Modal
        isOpen={isImageOpen}
        onClose={() => { setIsImageOpen(false); setPreviewUrl(null); }}
        title={content.title}
        size="xl"
      >
        {previewUrl ? (
          <div className="w-full flex items-center justify-center">
            <img src={previewUrl} alt={fileName ?? 'Imagen'} className="max-w-full max-h-[80vh] rounded-md" />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}


