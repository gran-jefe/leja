'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import api from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';

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
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Messages" subtitle="Conversations about your listings and agreements" icon={MessageCircle} />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton height="1.25rem" className="mb-2" width="50%" />
              <Skeleton height="1rem" width="80%" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchConversations} />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="Conversations you start from a property listing will show up here."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`}>
              <Card className="hover:border-forest transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {c.unread && <span className="w-2 h-2 rounded-full bg-ember flex-shrink-0" />}
                      <p
                        className={`font-body text-sm truncate ${c.unread ? 'font-bold text-charcoal' : 'font-semibold text-charcoal'}`}
                      >
                        {c.otherUser?.name || 'Unknown'}
                      </p>
                    </div>
                    {c.property && (
                      <p className="text-xs text-muted font-body mt-0.5 truncate">
                        {c.property.address}, {c.property.city}
                      </p>
                    )}
                    {c.lastMessage && (
                      <p className="text-sm text-muted font-body mt-1 truncate">
                        {c.lastMessage.body}
                      </p>
                    )}
                  </div>
                  {c.lastMessage && (
                    <span className="text-xs text-muted font-body whitespace-nowrap">
                      {formatDate(c.lastMessage.created_at)}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <MessagesInboxContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
