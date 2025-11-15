import React, { useState } from 'react';

import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { formatDate } from '@/helpers/utils';
import { Button } from '@/components/button/button';
import Modal from '@/components/modal/modal';

type Props = {
  authorName: string;
  authorPictureUrl?: string | null;
  createdDate: string;
  initialMessage: string;
  onReply?: () => void;
  onEdit?: (newMessage: string) => void;
  onDelete?: () => void;
  setMessage?: (message: string) => void;
};

export function PostItem({
  authorName,
  authorPictureUrl,
  createdDate,
  initialMessage,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string>(initialMessage);

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
                <Button size="sm" variant="outline" color="secondary" onClick={() => setEditing(true)}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="outline" color="secondary" onClick={() => setDeleting(true)}>
                  Eliminar
                </Button>
              )}
            </div>
          </div>
          {editing ? (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage?.(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 mt-3 text-sm text-text-neutral-50"
                rows={4}
              />

              <div className="flex items-center gap-2 justify-end">
                <Button size="sm" variant="outline" color="secondary" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>

                <Button
                  size="sm"
                  color="primary"
                  onClick={() => {
                    onEdit?.(message);
                    setEditing(false);
                  }}
                >
                  Guardar
                </Button>
              </div>
            </>
          )
          : <div className="mt-4 whitespace-pre-wrap text-text-neutral-50">{message}</div>}
        </div>
      </div>

      <Modal
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        footer={(
          <Button color="primary" onClick={() => onDelete?.()}>
            Eliminar
          </Button>
        )}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-color-70">¿Estás seguro de querer eliminar este post?</h2>
          <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
        </div>
      </Modal>
    </div>
  );
}


