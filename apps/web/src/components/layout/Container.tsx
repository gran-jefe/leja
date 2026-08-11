import React from 'react';
import { cn } from '@/lib/utils';

/**
 * One width scale. The app previously used eight different `max-w-*` values
 * across 25 screens (max-w-2xl ×12, max-w-4xl ×4, max-w-5xl ×4, max-w-3xl ×2,
 * max-w-6xl ×2, max-w-md, max-w-lg, and the dashboard with none at all — so it
 * ran edge-to-edge on a wide monitor while /agreements sat pinned at 896px).
 */
export type ContainerWidth = 'form' | 'content' | 'wide' | 'shell' | 'full';

const widths: Record<ContainerWidth, string> = {
  form: 'max-w-form', // 32rem — single-column forms, auth
  content: 'max-w-content', // 48rem — detail pages, reading
  wide: 'max-w-wide', // 64rem — lists, admin tables
  shell: 'max-w-shell', // 80rem — dashboards, marketing sections
  full: 'max-w-none',
};

export const Container: React.FC<{
  width?: ContainerWidth;
  className?: string;
  children: React.ReactNode;
}> = ({ width = 'shell', className, children }) => (
  <div className={cn('w-full mx-auto px-4 sm:px-6', widths[width], className)}>{children}</div>
);
