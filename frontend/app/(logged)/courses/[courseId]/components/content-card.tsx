"use client";
import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/helpers/utils';
import type { CourseContent } from '@/types/content';
import { ContentTypeIcon } from './content-type-icon';
import { ContentTypeFlag } from './content-type-flag';

interface ContentCardProps {
  courseId: string;
  content: CourseContent;
}

const ContentCard = ({ courseId, content }: ContentCardProps) => {
  const isEvaluation = content.type === 'evaluation' || content.type === 'quiz';
  const dueDate = isEvaluation ? (content as any).dueDate as string | null : null;
  const isOverdue = isEvaluation && dueDate ? new Date(dueDate) < new Date() : false;

  return (
    <Link
      href={`/courses/${courseId}/contents/${content.type}/${content.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-secondary-color-60 hover:shadow-sm transition-colors"
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-4 min-w-0 text-secondary-color-70">
          <ContentTypeIcon type={content.type} size={28} />

          <div className="flex flex-col items-start min-w-0">
            <ContentTypeFlag type={content.type} />
            <h2 className="text-2xl font-bold truncate">{content.title}</h2>
            {isEvaluation && dueDate ? (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-text-neutral-50">
                  Vence: {formatDate(dueDate)}
                </span>
                {isOverdue ? (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 border border-red-200">
                    Vencido
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <span className="ml-4 shrink-0 text-xs text-text-neutral-50">{formatDate(content.createdDate)}</span>
      </div>
    </Link>
  );
};

export { ContentCard };
