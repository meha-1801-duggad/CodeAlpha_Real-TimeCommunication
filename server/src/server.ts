import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import { CONFIG } from './config';
import { setupSocketHandlers } from './sockets/webrtcHandler';
import {
  register,
  login,
  createGuestSession,
  getMe,
  updateProfile,
} from './controllers/authController';
import {
  createRoom,
  getRoomByCode,
  verifyPasscode,
  getUserMeetingHistory,
} from './controllers/roomController';
import { authenticateToken, optionalAuth } from './middleware/auth';

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e8, // 100MB for data transfer chunking
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NexusMeet Real-Time API',
    version: '1.0.0',
  });
});

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/guest', createGuestSession);
app.get('/api/auth/me', authenticateToken, getMe);
app.put('/api/auth/profile', authenticateToken, updateProfile);

// Room Routes
app.post('/api/rooms', optionalAuth, createRoom);
app.get('/api/rooms/history', authenticateToken, getUserMeetingHistory);
app.get('/api/rooms/:code', getRoomByCode);
app.post('/api/rooms/:code/verify', verifyPasscode);

// Serve Client Static Build in Production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Initialize WebRTC and Collaboration Socket Handlers
setupSocketHandlers(io);

// Start Server
const PORT = CONFIG.PORT;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 NexusMeet Server running on port ${PORT}`);
  console.log(`📡 WebSocket Signaling gateway active`);
  console.log(`🔒 DTLS-SRTP & JWT Security enabled`);
  console.log(`===============================================`);
});

export { app, server, io };
