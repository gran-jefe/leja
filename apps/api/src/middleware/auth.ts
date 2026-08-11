import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { Capability, UserRole, resolveCapabilities } from '@beyond/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        /** What this user can do. May be empty for a new account. */
        capabilities?: Capability[];
        /** @deprecated Present only on tokens issued before capabilities. */
        role?: UserRole | null;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing token',
    });
  }

  try {
    const payload = verifyToken(token);
    // Normalise up front so every downstream check reads one shape, whether
    // the token predates capabilities or not.
    req.user = { ...payload, capabilities: resolveCapabilities(payload) };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
    });
  }
};

// Decodes the token and sets req.user when present and valid, but never
// rejects the request — for routes that behave differently for logged-in
// users (e.g. tenant vs landlord) while still being reachable publicly.
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { ...payload, capabilities: resolveCapabilities(payload) };
    } catch (err) {
      // Invalid/expired token on a public route — proceed unauthenticated
      // rather than rejecting.
    }
  }

  next();
};

/** True if the authenticated user holds the capability. */
export const userHas = (req: Request, capability: Capability): boolean =>
  Boolean(req.user?.capabilities?.includes(capability));

/**
 * Gate a route on holding at least one of the given capabilities.
 *
 * IMPORTANT — do not put this on a route that *grants* the capability.
 * Capabilities are earned by action: you become a LANDLORD by listing a
 * property and a TENANT by accepting an agreement. Guarding those two
 * endpoints with the capability they produce would make it unreachable.
 * Gate the routes that read or manage what already exists instead.
 */
export const requireCapability = (...capabilities: Capability[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const held = req.user.capabilities ?? [];
    if (!capabilities.some((c) => held.includes(c))) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * @deprecated Use `requireCapability`. Retained as a thin alias so any
 * unmigrated route keeps behaving identically.
 */
export const requireRole = (...roles: UserRole[]) =>
  requireCapability(...(roles as unknown as Capability[]));
