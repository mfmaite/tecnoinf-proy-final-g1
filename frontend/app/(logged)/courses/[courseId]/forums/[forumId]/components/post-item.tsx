import React from 'react';
import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { formatDate } from '@/helpers/utils';
import { Button } from '@/components/button/button';

type Props = {
  authorName: string;
  authorPictureUrl?: string | null;
  createdDate: string;
  message: string;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function PostItem({
  authorName,
  authorPictureUrl,
  createdDate,
  message,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-start gap-4">
        <UserProfilePicture name={authorName} pictureUrl={authorPictureUrl ?? undefined} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-sm font-semibold text-gray-800 truncate">{authorName}</div>
              <div className="text-xs text-gray-500">{formatDate(createdDate)}</div>
            </div>
            <div className="flex items-center gap-2">
              {onReply && (
                <Button size="sm" variant="outline" color="secondary" onClick={onReply}>
                  Responder
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="outline" color="secondary" onClick={onEdit}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="outline" color="secondary" onClick={onDelete}>
                  Eliminar
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-text-neutral-50">{message}</div>
        </div>
      </div>
    </div>
  );
}


