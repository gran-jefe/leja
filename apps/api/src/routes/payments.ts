import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { verifyPayment, verifyWebhookSignature } from '../lib/flutterwave';
import { markPaymentSuccessful } from '../db/queries/payments';
import { generateAndSaveAgreementPDF } from '../lib/pdf';
import { findAgreementById } from '../db/queries/agreements';
import { createAndAssignLegalReviewJob, awardJob, upgradeProviderSubscription } from '../db/queries/marketplace';
import { PaymentType } from '@beyond/shared';

const router = Router();

// Provider subscription payments have no agreement_id — this is the
// non-agreement counterpart to the lawyer-review handler below.
const handleProviderSubscriptionPayment = async (payment: { metadata?: Record<string, unknown> | null }) => {
  const providerId = payment.metadata?.providerId as string | undefined;
  if (!providerId) {
    console.error('[MARKETPLACE] PROVIDER_SUBSCRIPTION payment confirmed with no providerId in metadata');
    return;
  }
  try {
    await upgradeProviderSubscription(providerId);
  } catch (err) {
    console.error(`[MARKETPLACE] Failed to upgrade provider ${providerId} subscription:`, err);
  }
};

// Posts the optional lawyer-review job and assigns it to whichever
// in-house lawyer has the lightest load — no open bidding, since legal
// review is delivered by BeyondAgency's own salaried team, not independent
// bidders. Only ever called for TENANT_LAWYER_REVIEW payments — the base
// agreement is free and never goes through this. The extra awardJob call
// is a safety net for the rare case no internal lawyer is onboarded yet
// (job falls back to the old open-bid shape); it's a no-op once already
// awarded internally.
const postLawyerReviewJobAndAward = async (agreementId: string) => {
  try {
    const agreement = await findAgreementById(agreementId);
    if (!agreement) return;

    const job = await createAndAssignLegalReviewJob(agreementId, agreement.tenant_id);
    await awardJob(job.id);
  } catch (err) {
    console.error(`[MARKETPLACE] Failed to post/assign lawyer review job for agreement ${agreementId}:`, err);
  }
};

const triggerAgreementPDF = (agreementId: string) => {
  // Don't await — let it run in the background so the webhook responds fast.
  // Flutterwave requires a 200 within 30s; Chromium cold start alone can take 10-15s.
  generateAndSaveAgreementPDF(agreementId)
    .then((pdfUrl) => {
      console.log(`[PDF] Agreement ${agreementId} PDF generated: ${pdfUrl}`);
    })
    .catch((err) => {
      console.error(`[PDF] Failed to generate PDF for agreement ${agreementId}:`, err.message);
    });
};

router.post('/webhook', async (req: Request, res: Response) => {
  const hash = req.headers['verif-hash'] as string;

  if (!verifyWebhookSignature(hash)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  const { event, data } = req.body;

  try {
    if (event === 'charge.completed') {
      if (data?.status === 'successful') {
        const payment = await markPaymentSuccessful(data.tx_ref);

        if (payment?.agreement_id) {
          console.log(`[WEBHOOK] Payment confirmed for agreement ${payment.agreement_id} (${payment.type})`);
          triggerAgreementPDF(payment.agreement_id);
          if (payment.type === PaymentType.TENANT_LAWYER_REVIEW) {
            void postLawyerReviewJobAndAward(payment.agreement_id);
          }
        } else if (payment?.type === PaymentType.PROVIDER_SUBSCRIPTION) {
          void handleProviderSubscriptionPayment(payment);
        }
      }
    } else {
      console.log('Unhandled Flutterwave webhook event', { event });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  return res.sendStatus(200);
});

router.post('/verify/:transactionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const result = await verifyPayment(transactionId);

    if (result.status === 'successful') {
      const payment = await markPaymentSuccessful(result.reference);

      if (payment?.agreement_id) {
        triggerAgreementPDF(payment.agreement_id);
        if (payment.type === PaymentType.TENANT_LAWYER_REVIEW) {
          void postLawyerReviewJobAndAward(payment.agreement_id);
        }
      } else if (payment?.type === PaymentType.PROVIDER_SUBSCRIPTION) {
        void handleProviderSubscriptionPayment(payment);
      }
    }

    return res.json({
      success: true,
      data: result,
      message: 'Payment verified',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
});

router.post(
  '/regenerate-pdf/:agreementId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { agreementId } = req.params;
      const pdfUrl = await generateAndSaveAgreementPDF(agreementId);

      return res.json({
        success: true,
        data: { pdfUrl },
        message: 'PDF regenerated',
      });
    } catch (error: any) {
      console.error('Regenerate PDF error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to regenerate PDF',
      });
    }
  }
);

export default router;
