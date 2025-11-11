"use client";
import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/helpers/utils';
import type { CourseContent } from '@/types/content';
import { ContentTypeIcon } from './content-type-icon';

interface ContentCardProps {
  courseId: string;
  content: CourseContent;
}

const ContentCard = ({ courseId, content }: ContentCardProps) => {
  return (
    <Link
      href={`/courses/${courseId}/contents/${content.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-secondary-color-60 hover:shadow-sm transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <ContentTypeIcon type={content.type} size={50} />
          <h2 className="text-base font-semibold text-secondary-color-70 truncate">{content.title}</h2>
        </div>
        <span className="ml-4 shrink-0 text-xs text-text-neutral-50">{formatDate(content.createdDate)}</span>
      </div>
    </Link>
  );
};

export { ContentCard };
