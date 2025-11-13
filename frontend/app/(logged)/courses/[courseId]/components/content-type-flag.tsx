import React from 'react'

const ContentTypeFlag = ({ type }: { type: "simpleContent" | "evaluation" | "quiz" }) => {
  const getContentTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'simpleContent':
        return 'bg-blue-100 text-blue-800';
      case 'quiz':
        return 'bg-red-100 text-red-800';
      case 'evaluation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`shrink-0 inline-flex items-center rounded-full ${getContentTypeBadgeColor(type)} px-2 py-0.5 text-[10px] font-medium text-neutral-700 border border-neutral-200`}>
      {type === 'simpleContent'
        ? 'Simple'
        : type === 'evaluation'
          ? 'Evaluación'
          : 'Quiz'
      }
    </div>
  )
}

export { ContentTypeFlag };
