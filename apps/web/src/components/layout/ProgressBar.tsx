'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false, trickleSpeed: 160, minimum: 0.15 });

/**
 * The previous version only called `NProgress.done()` on pathname change, and
 * `start()` was invoked by hand in exactly two places (login and signup submit).
 * So the bar never appeared during route navigation — the case it exists for.
 *
 * App Router has no navigation-start event, so start is driven from link
 * interception: any click that resolves to a different in-app path.
 */
export function ProgressBar() {
  const pathname = usePathname();

  // Finish whenever the committed path changes.
  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Ignore modified clicks — those open a new tab, no navigation here.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      // Hash links and external origins don't trigger a route transition.
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      NProgress.start();
    };

    // Back/forward would otherwise leave a bar mid-flight.
    const onPopState = () => NProgress.done();

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return null;
}
