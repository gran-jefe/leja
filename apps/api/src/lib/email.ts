import { config } from '../config';

// No email-sending infrastructure existed anywhere in this codebase before
// this — Resend was picked for the fastest path to real sending (an API
// key and a plain fetch call, no SMTP setup, no new npm dependency). Every
// caller goes through sendEmail() below, which degrades to a logged no-op
// when RESEND_API_KEY isn't set, so the messaging feature this backs works
// end-to-end (conversations, replies, in-app inbox) even before anyone
// gets around to setting up sending — email is a notification layer on
// top, never a requirement.
export const sendEmail = async (data: { to: string; subject: string; html: string }): Promise<void> => {
  if (!config.email.resendApiKey) {
    console.log(`[EMAIL] (not sent — RESEND_API_KEY unset) To: ${data.to} | Subject: ${data.subject}`);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.email.fromAddress,
        to: data.to,
        subject: data.subject,
        html: data.html,
        reply_to: config.email.replyToAddress,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[EMAIL] Resend request failed (${res.status}): ${body}`);
    }
  } catch (err) {
    // Never let an email failure break the request that triggered it
    // (e.g. sending a message) — this is a notification, not the action.
    console.error('[EMAIL] Failed to send:', err);
  }
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const emailShell = (title: string, bodyHtml: string, ctaUrl: string, ctaLabel: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <p style="color: #1A7A4A; font-weight: bold; letter-spacing: 1px; font-size: 12px; text-transform: uppercase;">BeyondAgency</p>
    <h2 style="color: #0D1B2A; margin-top: 8px;">${title}</h2>
    ${bodyHtml}
    <a href="${ctaUrl}" style="display: inline-block; margin-top: 20px; background: #1A7A4A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">${ctaLabel}</a>
    <p style="color: #718096; font-size: 12px; margin-top: 32px;">You're receiving this because of activity on your BeyondAgency account.</p>
  </div>
`;

export const notifyNewMessage = async (params: {
  recipientEmail: string;
  senderName: string;
  propertyAddress: string;
  messagePreview: string;
  conversationUrl: string;
}) => {
  await sendEmail({
    to: params.recipientEmail,
    subject: `New message from ${params.senderName} — ${params.propertyAddress}`,
    html: emailShell(
      `New message about ${params.propertyAddress}`,
      `<p style="color: #2D3748;"><strong>${escapeHtml(params.senderName)}</strong> sent you a message on BeyondAgency:</p>
       <p style="color: #2D3748; background: #F7F9FC; padding: 12px 16px; border-radius: 8px;">${escapeHtml(params.messagePreview)}</p>`,
      params.conversationUrl,
      'Reply on BeyondAgency'
    ),
  });
};
