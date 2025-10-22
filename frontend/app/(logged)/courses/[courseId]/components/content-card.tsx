"use client";
import React from 'react'
import { formatDate, isImage, isVideo } from '@/helpers/utils';
import { SimpleContent } from '@/types/content';
import dynamic from 'next/dynamic';

const MarkdownPreview = dynamic<any>(() => import('@uiw/react-markdown-preview').then(m => m.default), { ssr: false });

interface ContentCardProps {
  content: SimpleContent
}

const ContentCard = ({ content }: ContentCardProps) => {
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
            <img className="w-full rounded-md" src={content.fileUrl} alt={content.fileName ?? 'Archivo'} />
          ) : (
            <a className="text-blue-600 underline" href={content.fileUrl} target="_blank" rel="noreferrer">
              {content.fileName ?? 'Ver archivo'}
            </a>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { ContentCard };
