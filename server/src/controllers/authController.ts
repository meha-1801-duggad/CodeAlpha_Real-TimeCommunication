import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { CONFIG } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Pick consistent avatar color based on name
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    const avatarColor = colors[name.length % colors.length];

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      avatar: avatarColor,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userSafe,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = db.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userSafe } = user;
    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userSafe,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createGuestSession = (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const guestName = name?.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    const avatarColor = colors[guestName.length % colors.length];

    const guestUser: User = {
      id: `guest_${uuidv4()}`,
      name: guestName,
      email: `${guestName.toLowerCase().replace(/\s+/g, '_')}@guest.local`,
      avatar: avatarColor,
      isGuest: true,
      createdAt: new Date().toISOString(),
    };

    db.createUser(guestUser);

    const token = jwt.sign(
      { id: guestUser.id, email: guestUser.email, name: guestUser.name, isGuest: true },
      CONFIG.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: guestUser,
    });
  } catch (error) {
    console.error('Guest session error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { passwordHash: _, ...userSafe } = req.user;
  return res.json({
    success: true,
    user: userSafe,
  });
};

export const updateProfile = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { name, avatar } = req.body;
  const updates: Partial<User> = {};
  if (name && name.trim()) updates.name = name.trim();
  if (avatar) updates.avatar = avatar;

  const updated = db.updateUser(req.user.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { passwordHash: _, ...userSafe } = updated;
  return res.json({
    success: true,
    user: userSafe,
  });
};
