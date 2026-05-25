import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/webhook', (req: Request, res: Response) => {
  const { data } = req.body;

  console.log('Paystack webhook - placeholder', {
    reference: data?.reference,
    status: data?.status,
  });

  return res.json({
    success: true,
    message: 'Webhook processed',
  });
});

router.post('/verify/:reference', authenticateToken, (req: Request, res: Response) => {
  const { reference } = req.params;

  console.log('Verify payment - placeholder', { reference });

  return res.json({
    success: true,
    data: {
      reference,
      status: 'success',
      amount: 350000,
    },
    message: 'Payment verified',
  });
});

export default router;
