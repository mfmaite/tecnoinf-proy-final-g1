import React from 'react';

import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { ForumPost } from '@/types/forum';
import { formatDate } from '@/helpers/utils';
import Link from 'next/link';

const PostCard = ({ post, courseId, forumId }: { post: ForumPost, courseId: string, forumId: string }) => {
  const getPreview = (message: string): { text: string; truncated: boolean } => {
    const trimmed = message.trim();
    if (trimmed.length <= 100) {
      return { text: trimmed, truncated: false };
    }
    return { text: trimmed.slice(0, 100), truncated: true };
  };
  const preview = getPreview(post.message);

  return (
    <Link href={`/courses/${courseId}/forums/${forumId}/posts/${post.id}`} className="p-4 flex items-start gap-4 bg-white rounded-lg border border-gray-200">
      <UserProfilePicture name={post.authorName} pictureUrl={post.authorPictureUrl ?? undefined} size="lg" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <div className="text-sm font-semibold text-text-neutral-50 truncate">{post.authorName}</div>
            <div className="text-xs text-text-neutral-50">{formatDate(post.createdDate)}</div>
          </div>
        </div>

        <div className="mt-2 text-sm text-text-neutral-50">
          {preview.text}
          {preview.truncated && (
            <>
              ...{' '}
              <Link
                href={`/courses/${courseId}/forums/${forumId}/posts/${post.id}`}
                className="text-primary-color-60 hover:underline"
              >
                Ver más
              </Link>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export { PostCard };

