import React from 'react';
import type { ContentType } from '@/types/content';
import { SimpleContentIcon } from '@/public/assets/icons/simple-content';
import { EvaluationIcon } from '@/public/assets/icons/evaluation';
import { QuizIcon } from '@/public/assets/icons/quiz';

type ContentTypeIconProps = {
  type: ContentType;
  size?: number;
  className?: string;
};

export function ContentTypeIcon({ type, size = 18, className }: ContentTypeIconProps) {
  const commonProps = { width: size, height: size, className };
  if (type === 'simpleContent') return <SimpleContentIcon {...commonProps} />;
  if (type === 'evaluation') return <EvaluationIcon {...commonProps} />;
  if (type === 'quiz') return <QuizIcon {...commonProps} />;
  return null;
}


