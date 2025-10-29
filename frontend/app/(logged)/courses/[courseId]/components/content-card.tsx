"use client";
import React, { useState } from 'react'
import { formatDate, isImage, isVideo } from '@/helpers/utils';
import { SimpleContent } from '@/types/content';
import dynamic from 'next/dynamic';
import { Modal } from '@/components/modal/modal';

const MarkdownPreview = dynamic<any>(() => import('@uiw/react-markdown-preview').then(m => m.default), { ssr: false });

interface ContentCardProps {
  content: SimpleContent
}

const ContentCard = ({ content }: ContentCardProps) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 text-text-neutral-50">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{content.title}</h2>
        <span className="text-xs text-text-neutral-50">{formatDate(content.createdDate)}</span>
      </div>

      {content.content ? (
        <div className="prose max-w-none" data-color-mode="light">
          <MarkdownPreview source={content.content} />
        </div>
      ) : null}

      {content.fileUrl ? (
        <div className="space-y-2">
          {isVideo(content.fileUrl) ? (
            <video controls className="w-full max-h-[480px] rounded-md" src={content.fileUrl} />
          ) : isImage(content.fileUrl) ? (
            <div className="w-full h-48 rounded-md bg-gray-50 flex items-center justify-center">
              <img
                className="max-h-full object-contain cursor-default hover:cursor-[zoom-in]"
                src={content.fileUrl}
                alt={content.fileName ?? 'Archivo'}
                onClick={() => { setPreviewUrl(content.fileUrl as string); setIsImageOpen(true); }}
              />
            </div>
          ) : (
            <a className="text-blue-600 underline" href={content.fileUrl} target="_blank" rel="noreferrer">
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
            <img src={previewUrl} alt={content.fileName ?? 'Imagen'} className="max-w-full max-h-[80vh] rounded-md" />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export { ContentCard };
