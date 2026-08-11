import { supabase } from '../index';
import { findPropertyById } from './properties';

export class PropertyNotFoundError extends Error {
  status = 404;
}

export class CannotMessageSelfError extends Error {
  status = 400;
}

// Starts a new thread (or reuses the existing one — a tenant messaging the
// same landlord about the same property twice should land in one
// conversation, not fork a new thread every time) and posts the tenant's
// opening message in the same call, so the frontend never has to make two
// round trips just to send the first message.
export const startOrGetConversation = async (data: {
  propertyId: string;
  tenantId: string;
  body: string;
}) => {
  const property = await findPropertyById(data.propertyId);
  if (!property) throw new PropertyNotFoundError('Property not found');
  if (property.landlord_id === data.tenantId) {
    throw new CannotMessageSelfError('You cannot message yourself about your own property');
  }

  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .eq('property_id', data.propertyId)
    .eq('landlord_id', property.landlord_id)
    .eq('tenant_id', data.tenantId)
    .eq('is_deleted', false)
    .maybeSingle();

  if (findError) throw new Error(`Failed to look up conversation: ${findError.message}`);

  let conversation = existing;
  if (!conversation) {
    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert({
        property_id: data.propertyId,
        landlord_id: property.landlord_id,
        tenant_id: data.tenantId,
      })
      .select('*')
      .single();

    if (createError) throw new Error(`Failed to start conversation: ${createError.message}`);
    conversation = created;
  }

  const message = await sendMessage({
    conversationId: conversation.id,
    senderId: data.tenantId,
    body: data.body,
  });

  return { conversation, message, property };
};

export const sendMessage = async (data: {
  conversationId: string;
  senderId: string;
  body: string;
}) => {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: data.conversationId,
      sender_id: data.senderId,
      body: data.body,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to send message: ${error.message}`);

  const { error: touchError } = await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', data.conversationId);
  if (touchError) throw new Error(`Failed to update conversation: ${touchError.message}`);

  return message;
};

export const findConversationById = async (id: string) => {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find conversation: ${error.message}`);
  }

  const [propertyResult, landlordResult, tenantResult] = await Promise.all([
    conversation.property_id
      ? supabase.from('properties').select('id, address, city, state').eq('id', conversation.property_id).single()
      : Promise.resolve({ data: null }),
    supabase.from('users').select('id, name, email, phone').eq('id', conversation.landlord_id).single(),
    supabase.from('users').select('id, name, email, phone').eq('id', conversation.tenant_id).single(),
  ]);

  return {
    ...conversation,
    property: propertyResult.data || null,
    landlord: landlordResult.data || null,
    tenant: tenantResult.data || null,
  };
};

export const listMessages = async (conversationId: string) => {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to list messages: ${error.message}`);
  return messages || [];
};

// A conversation is "unread" for a user if there's a message newer than
// that side's last-read marker that they didn't send themselves — checked
// in application code rather than a DB view since it's only evaluated
// against the (small) set of conversations being listed for one user.
// Side-agnostic: a user who is both a landlord and a tenant has conversations
// on both sides of the table, so this matches either column and works out which
// side they're on per row rather than once for the whole query.
export const listConversationsForUser = async (userId: string) => {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`landlord_id.eq.${userId},tenant_id.eq.${userId}`)
    .eq('is_deleted', false)
    .order('last_message_at', { ascending: false });

  if (error) throw new Error(`Failed to list conversations: ${error.message}`);
  if (!conversations || conversations.length === 0) return [];

  const otherIdFor = (c: any) => (c.landlord_id === userId ? c.tenant_id : c.landlord_id);
  const readColumnFor = (c: any) =>
    c.landlord_id === userId ? 'landlord_last_read_at' : 'tenant_last_read_at';

  const propertyIds = [...new Set(conversations.map((c: any) => c.property_id).filter(Boolean))];
  const otherUserIds = [...new Set(conversations.map(otherIdFor))];
  const conversationIds = conversations.map((c: any) => c.id);

  const [{ data: properties }, { data: otherUsers }, { data: lastMessages }] = await Promise.all([
    propertyIds.length
      ? supabase.from('properties').select('id, address, city, state').in('id', propertyIds)
      : Promise.resolve({ data: [] as any[] }),
    supabase.from('users').select('id, name, email').in('id', otherUserIds),
    supabase
      .from('messages')
      .select('conversation_id, body, sender_id, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false }),
  ]);

  const propertyMap = new Map((properties || []).map((p: any) => [p.id, p]));
  const userMap = new Map((otherUsers || []).map((u: any) => [u.id, u]));
  const lastMessageMap = new Map<string, any>();
  for (const m of lastMessages || []) {
    if (!lastMessageMap.has(m.conversation_id)) lastMessageMap.set(m.conversation_id, m);
  }

  return conversations.map((c: any) => {
    const lastMessage = lastMessageMap.get(c.id) || null;
    const readColumn = readColumnFor(c);
    const readAt = c[readColumn] ? new Date(c[readColumn]) : null;
    const unread =
      !!lastMessage &&
      lastMessage.sender_id !== userId &&
      (!readAt || new Date(lastMessage.created_at) > readAt);

    return {
      ...c,
      property: c.property_id ? propertyMap.get(c.property_id) || null : null,
      otherUser: userMap.get(otherIdFor(c)) || null,
      lastMessage,
      unread,
    };
  });
};

// Derives the side from the conversation row rather than a passed-in role, so
// a user who is both landlord and tenant marks the correct column.
export const markConversationRead = async (id: string, userId: string) => {
  const { data: conversation, error: findError } = await supabase
    .from('conversations')
    .select('landlord_id, tenant_id')
    .eq('id', id)
    .single();

  if (findError) throw new Error(`Failed to mark conversation read: ${findError.message}`);
  if (!conversation) return;

  const column =
    conversation.landlord_id === userId ? 'landlord_last_read_at' : 'tenant_last_read_at';

  const { error } = await supabase
    .from('conversations')
    .update({ [column]: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Failed to mark conversation read: ${error.message}`);
};
