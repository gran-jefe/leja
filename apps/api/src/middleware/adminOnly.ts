import { Request, Response, NextFunction } from 'express';
import { isAdmin } from '../lib/admin';

// Must run after authenticateToken — relies on req.user being set.
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!isAdmin(req.user?.email)) {
    return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
  }
  next();
};
