import React from 'react';

import UserProfilePicture from '@/components/user-profile-picture/user-profile-picture';
import { ForumPost } from '@/types/forum';
import { formatDate } from '@/helpers/utils';
import Link from 'next/link';

const PostCard = ({ post, courseId, forumId }: { post: ForumPost, courseId: string, forumId: string }) => {
  const getTitleFromMessage = (message: string): string => {
    const firstLine = message.split('\n')[0]?.trim() ?? '';
    if (firstLine.length <= 100) return firstLine || 'Ver post';
    return firstLine.slice(0, 100) + '…';
  };

  return (
    <div className="p-4 flex items-start gap-4 bg-white rounded-lg border border-gray-200">
      <UserProfilePicture name={post.authorName} pictureUrl={post.authorPictureUrl ?? undefined} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <div className="text-sm font-semibold text-text-neutral-50 truncate">{post.authorName}</div>
            <div className="text-xs text-text-neutral-50">{formatDate(post.createdDate)}</div>
          </div>
        </div>

        <Link
          href={`/courses/${courseId}/forums/${forumId}/posts/${post.id}`}
          className="block mt-2 text-base font-medium text-text-neutral-50 hover:text-secondary-color-70"
        >
          {getTitleFromMessage(post.message)}
        </Link>
      </div>
    </div>
  )
}

export { PostCard };

