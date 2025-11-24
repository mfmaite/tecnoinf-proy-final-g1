import React from 'react';
import type { EvaluationSubmission } from '@/types/evaluation-submission';

type Props = {
  submission: EvaluationSubmission;
};

export function EvaluationSubmissionCard({ submission }: Props) {
  return (
    <div className="p-4 border rounded-md space-y-2 bg-white border-surface-light-40 text-text-neutral-50">
      <h2 className="text-lg font-semibold text-secondary-color-70">Entrega</h2>
      {submission.fileUrl && (
        <div className="text-sm">
          <span className="font-bold">Archivo:</span>{' '}
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-color-70 underline"
          >
            {submission.fileName || 'Ver archivo'}
          </a>
        </div>
      )}

      {submission.solution && (
        <div className="text-sm">
          <span className="font-bold">Contenido:</span>{' '}
          {submission.solution}
        </div>
      )}

      {submission.note != null && (
        <div className="text-sm">
          <span className="font-bold">Nota:</span>{' '}
          {submission.note}
        </div>
      )}
    </div>
  );
}


