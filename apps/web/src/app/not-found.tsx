import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-navy-900 grain-overlay relative flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-content text-center">
        <p className="font-mono text-label uppercase text-brass-300 mb-4">Error 404</p>
        <h1 className="font-display text-display-lg font-semibold text-on-dark mb-4">
          This page doesn&apos;t exist.
        </h1>
        <p className="font-body text-body-lg text-on-dark-muted mb-10 max-w-prose mx-auto">
          The link may be out of date, or the agreement or property you&apos;re looking for may
          have been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button fullWidth>Go to dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" onDark fullWidth>
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
