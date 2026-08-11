import jwt from 'jsonwebtoken';
import { Capability, UserRole } from '@beyond/shared';
import { config } from '../config';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  /** What this user can do. Absent on tokens issued before capabilities. */
  capabilities?: Capability[];
  /** @deprecated Only present on pre-capability tokens, until they expire. */
  role?: UserRole | null;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
};
