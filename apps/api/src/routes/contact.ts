import { Router, Request, Response, NextFunction } from 'express';
import { contactSchema } from '../lib/schemas';

const router = Router();

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    console.log(`[CONTACT] ${new Date().toISOString()}`, parsed.data);

    return res.status(200).json({
      success: true,
      message: 'Demo request received',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
