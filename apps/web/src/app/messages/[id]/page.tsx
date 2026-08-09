'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface ConversationDetail {
  id: string;
  property: { address: string; city: string; state: string } | null;
  landlord: { id: string; name: string; email: string } | null;
  tenant: { id: string; name: string; email: string } | null;
}

function ThreadContent() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchThread = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/messages/conversations/${id}`);
      setConversation(res.data.data.conversation);
      setMessages(res.data.data.messages || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load conversation'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await api.post(`/messages/conversations/${id}/messages`, { body: reply.trim() });
      setMessages((prev) => [...prev, res.data.data]);
      setReply('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  const otherParty =
    conversation && user
      ? conversation.landlord?.id === user.id
        ? conversation.tenant
        : conversation.landlord
      : null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1 text-sm font-body text-muted hover:text-navy mb-6"
      >
        <ArrowLeft size={16} />
        Back to messages
      </Link>

      {loading ? (
        <Card>
          <Skeleton height="1.5rem" className="mb-4" width="50%" />
          <Skeleton height="3rem" className="mb-2" />
          <Skeleton height="3rem" width="70%" />
        </Card>
      ) : error && !conversation ? (
        <ErrorState message={error} onRetry={fetchThread} />
      ) : conversation ? (
        <>
          <div className="mb-4">
            <h1 className="font-display text-xl font-bold text-navy">{otherParty?.name || 'Conversation'}</h1>
            {conversation.property && (
              <p className="font-body text-sm text-muted">
                {conversation.property.address}, {conversation.property.city}
              </p>
            )}
          </div>

          <Card className="mb-4 max-h-[28rem] overflow-y-auto">
            <div className="space-y-3">
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-button px-4 py-2 font-body text-sm ${
                        mine ? 'bg-forest text-white' : 'bg-cream text-charcoal'
                      }`}
                    >
                      <p>{m.body}</p>
                      <p className={`text-xs mt-1 ${mine ? 'text-white text-opacity-70' : 'text-muted'}`}>
                        {formatDate(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </Card>

          {error && <p className="text-sm text-ember font-body mb-2">{error}</p>}

          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Write a reply..."
              className="flex-1 px-4 py-2 font-body text-sm border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
            />
            <Button
              variant="primary"
              className="flex items-center gap-2 flex-shrink-0"
              loading={sending}
              onClick={handleSend}
            >
              <Send size={16} />
              Send
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function ConversationPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <ThreadContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
