import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { verifyPayment, verifyWebhookSignature } from '../lib/flutterwave';
import { markPaymentSuccessful } from '../db/queries/payments';

const router = Router();

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
        await markPaymentSuccessful(data.tx_ref);
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
      await markPaymentSuccessful(result.reference);
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

export default router;
