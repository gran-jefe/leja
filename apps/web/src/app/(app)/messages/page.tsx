'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card } from '@/components/ui/Card';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import api from '@/lib/api';
import { cn, formatDayLabel, getErrorMessage } from '@/lib/utils';

interface ConversationSummary {
  id: string;
  property: { address: string; city: string; state: string } | null;
  otherUser: { name: string; email: string } | null;
  lastMessage: { body: string; created_at: string; sender_id: string } | null;
  unread: boolean;
}

function MessagesInboxContent() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load messages'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="max-w-content mx-auto">
      <PageHeader
        title="Messages"
        subtitle="Conversations about your listings and agreements."
        icon={MessageCircle}
      />

      {loading ? (
        <SkeletonList count={4} lines={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchConversations} size="page" />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="Conversations you start from a property listing will show up here."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className={cn(
                'block rounded-card border bg-white p-4 transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
                // Unread was signalled only by bold-vs-semibold plus a small
                // dot \u2014 near invisible. It now carries a brass left edge.
                c.unread
                  ? 'border-brass-300 bg-brass-50/60 border-l-[3px] border-l-brass-500 hover:bg-brass-50'
                  : 'border-ink-200 hover:bg-ink-50 hover:border-ink-300'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold flex-shrink-0',
                    c.unread ? 'bg-brass-500 text-ink-950' : 'bg-ink-100 text-ink-600'
                  )}
                >
                  {(c.otherUser?.name || '?').charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className={cn(
                        'font-body truncate',
                        c.unread ? 'font-bold text-ink-900' : 'font-semibold text-ink-800'
                      )}
                    >
                      {c.otherUser?.name || 'Unknown'}
                      {c.unread && <span className="sr-only"> (unread)</span>}
                    </p>
                    {c.lastMessage && (
                      <span className="font-mono text-body-sm text-ink-400 whitespace-nowrap flex-shrink-0">
                        {formatDayLabel(c.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  {c.property && (
                    <p className="font-body text-body-sm text-ink-400 mt-0.5 truncate">
                      {c.property.address}, {c.property.city}
                    </p>
                  )}
                  {c.lastMessage && (
                    <p
                      className={cn(
                        'font-body text-body-sm mt-1 truncate',
                        c.unread ? 'text-ink-700' : 'text-ink-500'
                      )}
                    >
                      {c.lastMessage.body}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return <MessagesInboxContent />;
}
