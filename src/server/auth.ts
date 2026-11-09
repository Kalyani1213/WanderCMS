import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { User, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'wandercms_secure_auth_token_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export function signToken(user: { id: string; email: string; name: string; role: UserRole }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Authenticates any valid logged-in user
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.wandercms_token ||
    req.headers.authorization?.replace(/^Bearer\s+/, '') ||
    req.query?.auth_token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const decoded = verifyToken(token as string);
  if (!decoded) {
    res.status(401).json({ error: 'Session expired or invalid token.' });
    return;
  }

  req.user = decoded;
  next();
}

/**
 * Middleware: Enforces Staff Admin role
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'staff-admin') {
      res.status(403).json({ error: 'Access forbidden. Staff admin privileges required.' });
      return;
    }
    next();
  });
}
