'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { cn, formatDayLabel, formatTime, getErrorMessage } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  pending?: boolean;
}

interface ConversationDetail {
  id: string;
  property: { address: string; city: string; state: string } | null;
  landlord: { id: string; name: string; email: string } | null;
  tenant: { id: string; name: string; email: string } | null;
}

const initials = (name?: string) => (name ? name.charAt(0).toUpperCase() : '?');

function ThreadContent() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchThread = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const res = await api.get(`/messages/conversations/${id}`);
        setConversation(res.data.data.conversation);
        // Don't clobber an optimistic message that hasn't been confirmed yet.
        setMessages((prev) => {
          const server: Message[] = res.data.data.messages || [];
          const stillPending = prev.filter(
            (m) => m.pending && !server.some((s) => s.body === m.body && s.sender_id === m.sender_id)
          );
          return [...server, ...stillPending];
        });
        setError('');
      } catch (err) {
        if (showSpinner) setError(getErrorMessage(err, 'Failed to load conversation'));
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  // The thread previously fetched once on mount, so a reply from the other
  // party never appeared without a manual reload.
  useEffect(() => {
    const timer = setInterval(() => fetchThread(false), 10000);
    return () => clearInterval(timer);
  }, [fetchThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const body = reply.trim();
    if (!body || sending) return;

    setSending(true);
    setSendError('');

    // Optimistic — the message appears immediately instead of after the
    // round trip.
    const optimistic: Message = {
      id: `pending-${Date.now()}`,
      sender_id: user?.id ?? '',
      body,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setReply('');

    try {
      const res = await api.post(`/messages/conversations/${id}/messages`, { body });
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? res.data.data : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setReply(body);
      setSendError(getErrorMessage(err, 'Failed to send message'));
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
    <div className="max-w-content mx-auto">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 font-body text-body-sm text-ink-500 hover:text-ink-800 mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to messages
      </Link>

      {loading ? (
        <Card>
          <Skeleton height="1.5rem" className="mb-4" width="50%" />
          <Skeleton height="3rem" className="mb-2" />
          <Skeleton height="3rem" width="70%" />
        </Card>
      ) : error && !conversation ? (
        <ErrorState message={error} onRetry={() => fetchThread()} size="page" />
      ) : conversation ? (
        <>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-full bg-navy-900 text-on-dark flex items-center justify-center font-body font-semibold flex-shrink-0">
              {initials(otherParty?.name)}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-title font-semibold text-navy-900 truncate">
                {otherParty?.name || 'Conversation'}
              </h1>
              {conversation.property && (
                <p className="font-body text-body-sm text-ink-500 truncate">
                  {conversation.property.address}, {conversation.property.city}
                </p>
              )}
            </div>
          </div>

          {/* Viewport-relative rather than a fixed max-h-[28rem], which left
              the composer floating mid-screen on tall phones. */}
          <Card className="mb-4 h-[calc(100vh-22rem)] min-h-[18rem] overflow-y-auto">
            <div className="space-y-1">
              {messages.map((m, i) => {
                const mine = m.sender_id === user?.id;
                const prev = messages[i - 1];
                const newDay =
                  !prev ||
                  new Date(prev.created_at).toDateString() !==
                    new Date(m.created_at).toDateString();
                // Group consecutive messages from the same sender.
                const grouped = prev && !newDay && prev.sender_id === m.sender_id;

                return (
                  <div key={m.id}>
                    {newDay && (
                      <div className="flex items-center gap-3 py-4">
                        <span className="flex-1 h-px bg-ink-200" />
                        <span className="font-mono text-label uppercase text-ink-400">
                          {formatDayLabel(m.created_at)}
                        </span>
                        <span className="flex-1 h-px bg-ink-200" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'flex',
                        mine ? 'justify-end' : 'justify-start',
                        grouped ? 'mt-0.5' : 'mt-3'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] px-4 py-2.5 font-body text-body-sm',
                          mine
                            ? 'bg-navy-900 text-on-dark rounded-chat-mine'
                            : 'bg-ink-100 text-ink-800 rounded-chat',
                          m.pending && 'opacity-60'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p
                          className={cn(
                            'font-mono text-body-sm mt-1',
                            mine ? 'text-on-dark-muted' : 'text-ink-400'
                          )}
                        >
                          {m.pending ? 'Sending…' : formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </Card>

          {sendError && (
            <Alert tone="error" size="sm" className="mb-3">
              {sendError}
            </Alert>
          )}

          <div className="flex gap-2 items-end">
            <label htmlFor="reply" className="sr-only">
              Write a reply
            </label>
            <textarea
              id="reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Write a reply…"
              className="flex-1 px-4 py-2.5 font-body text-body-sm bg-white border border-ink-200 rounded-button resize-none focus:outline-none focus:border-brass-500 focus:ring-2 focus:ring-brass-500/30 transition-colors"
            />
            <Button
              loading={sending}
              disabled={!reply.trim()}
              onClick={handleSend}
              leadingIcon={<Send size={16} />}
              className="flex-shrink-0"
            >
              Send
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function ConversationPage() {
  return <ThreadContent />;
}
