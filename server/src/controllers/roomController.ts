import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { Room } from '../types';

// Helper to generate Google Meet-like formatted code: "nex-839-vqw"
const generateRoomCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment(3)}-${segment(3)}-${segment(3)}`;
};

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, passcode, isLocked } = req.body;
    const userId = req.user?.id || 'guest_host';
    const userName = req.user?.name || 'Meeting Host';

    let passcodeHash: string | null = null;
    if (passcode && passcode.trim()) {
      const salt = await bcrypt.genSalt(10);
      passcodeHash = await bcrypt.hash(passcode.trim(), salt);
    }

    let code = generateRoomCode();
    // Ensure code uniqueness
    while (db.findRoomByCode(code)) {
      code = generateRoomCode();
    }

    const room: Room = {
      id: uuidv4(),
      code,
      title: title?.trim() || `${userName}'s Meeting`,
      hostId: userId,
      hostName: userName,
      passcodeHash,
      isLocked: Boolean(isLocked),
      maxParticipants: 12,
      createdAt: new Date().toISOString(),
    };

    db.createRoom(room);

    // Save host meeting record
    if (req.user) {
      db.addMeetingRecord({
        id: uuidv4(),
        userId: req.user.id,
        roomCode: room.code,
        roomTitle: room.title,
        role: 'host',
        joinedAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        title: room.title,
        hostName: room.hostName,
        hasPasscode: Boolean(room.passcodeHash),
        isLocked: room.isLocked,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRoomByCode = (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const room = db.findRoomByCode(code);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Meeting room not found' });
    }

    return res.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        title: room.title,
        hostName: room.hostName,
        hasPasscode: Boolean(room.passcodeHash),
        isLocked: room.isLocked,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyPasscode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { passcode } = req.body;

    const room = db.findRoomByCode(code);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (!room.passcodeHash) {
      return res.json({ success: true, verified: true });
    }

    if (!passcode) {
      return res.status(400).json({ success: false, message: 'Passcode required' });
    }

    const isValid = await bcrypt.compare(passcode, room.passcodeHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Incorrect passcode' });
    }

    return res.json({ success: true, verified: true });
  } catch (error) {
    console.error('Verify passcode error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUserMeetingHistory = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const meetings = db.getUserMeetings(req.user.id);
    return res.json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
