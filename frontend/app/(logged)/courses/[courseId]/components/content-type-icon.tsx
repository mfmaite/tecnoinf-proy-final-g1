import React from 'react';
import type { ContentType } from '@/types/content';

type ContentTypeIconProps = {
  type: ContentType;
  size?: number;
  className?: string;
};

export function ContentTypeIcon({ type, size = 18, className }: ContentTypeIconProps) {
  const commonProps = {
    width: size,
    height: size,
    className,
  };

  switch (type) {
    case 'simpleContent':
      return <img src="/assets/icons/simple-content.svg" alt="Contenido simple" {...commonProps} />;
    case 'evaluation':
      return <img src="/assets/icons/evaluation.svg" alt="Evaluación" {...commonProps} />;
    case 'quiz':
      return <img src="/assets/icons/quiz.svg" alt="Quiz" {...commonProps} />;
    default:
      return null;
  }
}


