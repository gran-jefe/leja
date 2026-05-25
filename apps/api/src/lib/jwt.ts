import jwt from 'jsonwebtoken';
import { UserRole } from '@leja/shared';
import { config } from '../config';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
};
