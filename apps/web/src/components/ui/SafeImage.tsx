'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ALLOWED_HOSTS = [/\.supabase\.co$/, /\.supabase\.in$/];

/**
 * Property photos are landlord-typed URL text fields, so they can point at any
 * host. `next/image` throws at runtime for hosts outside `remotePatterns`, so
 * this optimises what it can and falls back to a plain <img> for the rest —
 * rather than crashing the page on a listing someone pasted an Imgur link into.
 *
 * When photos move to Supabase Storage uploads, the fallback branch can go.
 */
export function SafeImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
  fallback,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback ?? null}</>;

  let optimisable = false;
  try {
    const url = new URL(src);
    optimisable = url.protocol === 'https:' && ALLOWED_HOSTS.some((re) => re.test(url.hostname));
  } catch {
    // Relative or malformed URL — next/image handles relative paths fine.
    optimisable = src.startsWith('/');
  }

  if (optimisable) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={cn('object-cover', fill && 'absolute inset-0 w-full h-full', className)}
    />
  );
}
