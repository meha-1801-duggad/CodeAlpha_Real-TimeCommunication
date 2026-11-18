import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';
import { db } from '../db/database';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as { id: string; email: string };
    const user = db.findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as { id: string; email: string };
    const user = db.findUserById(payload.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // ignore optional token failure
  }
  next();
};
