'use client';

import { createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';

const InShell = createContext(false);

/**
 * App chrome: sidebar + main column.
 *
 * Nesting-safe on purpose. The shell now lives in `app/(app)/layout.tsx`, but
 * 22 pages still import it directly (and two — agreement/[id]/pay and
 * provider/dashboard/pay — forgot to, which is why the payment step rendered
 * with no navigation at all). Rendering a nested DashboardShell is a no-op, so
 * those page-level imports can be removed screen by screen in Phase C rather
 * than in one large sweep.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const alreadyInShell = useContext(InShell);

  if (alreadyInShell) return <>{children}</>;

  return (
    <InShell.Provider value={true}>
      <div className="flex flex-col md:flex-row min-h-screen bg-paper">
        <Sidebar />
        <main id="main" className="flex-1 min-w-0 p-4 md:p-8">
          {children}
        </main>
      </div>
    </InShell.Provider>
  );
}
