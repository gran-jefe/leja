-- In-app messaging: keeps a tenant's first contact with a landlord inside
-- the platform instead of bouncing them out to WhatsApp/email with no
-- record of the interaction. One thread per (tenant, landlord, property);
-- either side can reply once it exists.
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  landlord_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES users(id),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Simple per-side "seen up to" marker for an unread indicator in the
  -- inbox — no per-message read receipts, that's more than this needs.
  landlord_last_read_at TIMESTAMPTZ,
  tenant_last_read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER conversations_update_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX idx_conversations_unique_thread
  ON conversations(property_id, landlord_id, tenant_id);
CREATE INDEX idx_conversations_landlord_id ON conversations(landlord_id);
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
