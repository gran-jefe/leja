import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { verifyPayment, verifyWebhookSignature } from '../lib/flutterwave';
import { markPaymentSuccessful } from '../db/queries/payments';
import { generateAndSaveAgreementPDF } from '../lib/pdf';

const router = Router();

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
          console.log(`[WEBHOOK] Tenant move-in fee confirmed for agreement ${payment.agreement_id}`);
          triggerAgreementPDF(payment.agreement_id);
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
