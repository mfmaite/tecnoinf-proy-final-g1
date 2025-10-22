import React from 'react';

interface ChevronDownProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const ChevronDown = ({ className, width = 16, height = 16, strokeWidth = 2 }: ChevronDownProps) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export { ChevronDown };
