'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in Vercel logs; the digest is the only handle on a prod stack.
    console.error('Route error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-content text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-button bg-danger-50 text-danger-600 mb-6">
          <AlertTriangle size={26} aria-hidden />
        </span>
        <h1 className="font-display text-display-md font-semibold text-navy-900 mb-3">
          Something went wrong on our end.
        </h1>
        <p className="font-body text-body-lg text-ink-500 mb-8">
          This one is on us, not you. Nothing you were working on has been lost — try again, or
          head back to your dashboard.
        </p>
        {error.digest && (
          <p className="font-mono text-body-sm text-ink-400 mb-8">Reference: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Link href="/dashboard">
            <Button variant="secondary" fullWidth>
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
