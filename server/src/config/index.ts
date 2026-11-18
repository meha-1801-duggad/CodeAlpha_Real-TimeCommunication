import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'nexusmeet-ultra-secure-jwt-secret-key-3.14159',
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  MAX_ROOM_PARTICIPANTS: 12,
  STUN_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};
