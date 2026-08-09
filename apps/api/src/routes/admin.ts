import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminOnly';
import { isAdmin } from '../lib/admin';
import { listUsers, listAgreements, listPayments, getAdminStats } from '../db/queries/admin';

const router = Router();

// Lets the frontend check "am I even allowed to be here" once on page
// load, instead of every subsequent admin call failing individually with a
// 403 the UI has to interpret. Safe to call from any authenticated user —
// it reveals nothing beyond whether their own email is on the allowlist.
router.get('/whoami', authenticateToken, async (req: Request, res: Response) => {
  return res.json({ success: true, data: { isAdmin: isAdmin(req.user!.email) } });
});

router.use(authenticateToken, requireAdmin);

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getAdminStats();
    return res.json({ success: true, data: stats, message: 'Admin stats retrieved' });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, limit, offset } = req.query as { search?: string; limit?: string; offset?: string };
    const result = await listUsers({
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return res.json({ success: true, data: result, message: 'Users retrieved' });
  } catch (error) {
    next(error);
  }
});

router.get('/agreements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit, offset } = req.query as { status?: string; limit?: string; offset?: string };
    const result = await listAgreements({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return res.json({ success: true, data: result, message: 'Agreements retrieved' });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type, limit, offset } = req.query as {
      status?: string;
      type?: string;
      limit?: string;
      offset?: string;
    };
    const result = await listPayments({
      status,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return res.json({ success: true, data: result, message: 'Payments retrieved' });
  } catch (error) {
    next(error);
  }
});

export default router;
