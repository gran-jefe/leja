import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className,
}) => {
  return (
    <div
      className={cn('bg-gray-200 animate-pulse rounded', className)}
      style={{ width, height }}
    />
  );
};
