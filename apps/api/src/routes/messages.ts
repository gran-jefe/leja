import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { UserRole } from '@beyond/shared';
import { startConversationSchema, sendMessageSchema } from '../lib/schemas';
import {
  startOrGetConversation,
  sendMessage,
  findConversationById,
  listMessages,
  listConversationsForUser,
  markConversationRead,
  PropertyNotFoundError,
  CannotMessageSelfError,
} from '../db/queries/messages';
import { notifyNewMessage } from '../lib/email';
import { config } from '../config';

const router = Router();

// Fire-and-forget — a slow or failed email should never hold up (or fail)
// the actual message send. See lib/email.ts for the no-op-without-key
// fallback.
const notifyAsync = (params: Parameters<typeof notifyNewMessage>[0]) => {
  void notifyNewMessage(params).catch((err) =>
    console.error('[MESSAGES] Failed to send notification email:', err)
  );
};

// A tenant messaging a landlord about a listing — the in-app replacement
// for "contact the landlord" links that bounced the tenant out to
// WhatsApp/email with no record. Tenant-initiated only; a landlord can't
// cold-message a tenant this way.
router.post(
  '/conversations',
  authenticateToken,
  requireRole(UserRole.TENANT),
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = startConversationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const { conversation, message, property } = await startOrGetConversation({
        propertyId: parsed.data.propertyId,
        tenantId: req.user!.id,
        body: parsed.data.body,
      });

      notifyAsync({
        recipientEmail: property.landlord_email,
        senderName: req.user!.name,
        propertyAddress: property.address,
        messagePreview: parsed.data.body,
        conversationUrl: `${config.frontendUrl}/messages/${conversation.id}`,
      });

      return res.status(201).json({
        success: true,
        data: { conversation, message },
        message: 'Message sent',
      });
    } catch (error: any) {
      if (error instanceof PropertyNotFoundError || error instanceof CannotMessageSelfError) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

router.get('/conversations', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== UserRole.LANDLORD && req.user!.role !== UserRole.TENANT) {
      return res.json({ success: true, data: [], message: 'Conversations retrieved' });
    }

    const conversations = await listConversationsForUser(req.user!.id, req.user!.role);

    return res.json({
      success: true,
      data: conversations,
      message: 'Conversations retrieved',
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/conversations/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await findConversationById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }
      if (![conversation.landlord_id, conversation.tenant_id].includes(req.user!.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const messages = await listMessages(conversation.id);

      const role = conversation.landlord_id === req.user!.id ? 'LANDLORD' : 'TENANT';
      await markConversationRead(conversation.id, role);

      return res.json({
        success: true,
        data: { conversation, messages },
        message: 'Conversation retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/conversations/:id/messages',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const conversation = await findConversationById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }
      if (![conversation.landlord_id, conversation.tenant_id].includes(req.user!.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const message = await sendMessage({
        conversationId: conversation.id,
        senderId: req.user!.id,
        body: parsed.data.body,
      });

      const isLandlord = conversation.landlord_id === req.user!.id;
      const recipient = isLandlord ? conversation.tenant : conversation.landlord;
      if (recipient?.email) {
        notifyAsync({
          recipientEmail: recipient.email,
          senderName: req.user!.name,
          propertyAddress: conversation.property?.address || 'your conversation',
          messagePreview: parsed.data.body,
          conversationUrl: `${config.frontendUrl}/messages/${conversation.id}`,
        });
      }

      return res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
