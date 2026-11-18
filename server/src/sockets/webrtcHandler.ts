import { Server, Socket } from 'socket.io';
import { Participant, ChatMessage, WhiteboardElement } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface RoomState {
  participants: Map<string, Participant>; // socketId -> Participant
  whiteboardElements: WhiteboardElement[];
  chatMessages: ChatMessage[];
}

export const setupSocketHandlers = (io: Server) => {
  const rooms = new Map<string, RoomState>();

  const getOrCreateRoom = (roomCode: string): RoomState => {
    const code = roomCode.toLowerCase();
    if (!rooms.has(code)) {
      rooms.set(code, {
        participants: new Map(),
        whiteboardElements: [],
        chatMessages: [],
      });
    }
    return rooms.get(code)!;
  };

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    let currentRoomCode: string | null = null;
    let currentUser: Participant | null = null;

    // Join room
    socket.on('join-room', ({ roomCode, user }: { roomCode: string; user: { id: string; name: string; avatar?: string } }) => {
      const code = roomCode.toLowerCase();
      currentRoomCode = code;
      const room = getOrCreateRoom(code);

      const isFirst = room.participants.size === 0;

      const participant: Participant = {
        socketId: socket.id,
        userId: user.id || socket.id,
        name: user.name || 'Anonymous',
        avatar: user.avatar || '#6366f1',
        isHost: isFirst,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        isHandRaised: false,
        joinedAt: Date.now(),
      };

      currentUser = participant;
      room.participants.set(socket.id, participant);
      socket.join(code);

      console.log(`User ${participant.name} (${socket.id}) joined room ${code}`);

      // 1. Send the newcomer existing participants in the room
      const existing = Array.from(room.participants.values()).filter(p => p.socketId !== socket.id);
      socket.emit('room-joined', {
        myParticipant: participant,
        existingParticipants: existing,
        whiteboardElements: room.whiteboardElements,
        chatHistory: room.chatMessages.slice(-50),
      });

      // 2. Notify other participants about new arrival
      socket.to(code).emit('participant-joined', participant);

      // 3. System chat notification
      const sysMsg: ChatMessage = {
        id: uuidv4(),
        roomId: code,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '',
        text: `${participant.name} joined the meeting`,
        timestamp: Date.now(),
        isSystem: true,
      };
      room.chatMessages.push(sysMsg);
      io.to(code).emit('chat-message', sysMsg);
    });

    // WebRTC Signaling: Offer / Answer
    socket.on('signal', ({ to, signal }: { to: string; signal: any }) => {
      io.to(to).emit('signal', {
        from: socket.id,
        signal,
      });
    });

    // WebRTC ICE Candidate Exchange
    socket.on('ice-candidate', ({ to, candidate }: { to: string; candidate: any }) => {
      io.to(to).emit('ice-candidate', {
        from: socket.id,
        candidate,
      });
    });

    // Media state change (Mute, Video off, Screen share)
    socket.on('media-toggle', ({ isMuted, isVideoOff, isScreenSharing }: { isMuted: boolean; isVideoOff: boolean; isScreenSharing: boolean }) => {
      if (!currentRoomCode || !currentUser) return;
      currentUser.isMuted = isMuted;
      currentUser.isVideoOff = isVideoOff;
      currentUser.isScreenSharing = isScreenSharing;

      socket.to(currentRoomCode).emit('participant-media-changed', {
        socketId: socket.id,
        isMuted,
        isVideoOff,
        isScreenSharing,
      });
    });

    // Active speaker detection
    socket.on('speaking-state', ({ isSpeaking }: { isSpeaking: boolean }) => {
      if (!currentRoomCode) return;
      socket.to(currentRoomCode).emit('participant-speaking', {
        socketId: socket.id,
        isSpeaking,
      });
    });

    // Hand raise toggle
    socket.on('raise-hand', ({ isHandRaised }: { isHandRaised: boolean }) => {
      if (!currentRoomCode || !currentUser) return;
      currentUser.isHandRaised = isHandRaised;
      currentUser.handRaisedAt = isHandRaised ? Date.now() : undefined;

      io.to(currentRoomCode).emit('participant-hand-toggled', {
        socketId: socket.id,
        isHandRaised,
        handRaisedAt: currentUser.handRaisedAt,
      });
    });

    // Emoji reactions
    socket.on('send-reaction', ({ emoji }: { emoji: string }) => {
      if (!currentRoomCode || !currentUser) return;
      io.to(currentRoomCode).emit('reaction-received', {
        id: uuidv4(),
        senderName: currentUser.name,
        emoji,
        timestamp: Date.now(),
      });
    });

    // In-meeting Chat messages
    socket.on('chat-message', ({ text, file }: { text: string; file?: any }) => {
      if (!currentRoomCode || !currentUser) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const message: ChatMessage = {
        id: uuidv4(),
        roomId: currentRoomCode,
        senderId: currentUser.userId,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: text || '',
        timestamp: Date.now(),
        file,
      };

      room.chatMessages.push(message);
      io.to(currentRoomCode).emit('chat-message', message);
    });

    // Collaborative Whiteboard: Draw element
    socket.on('whiteboard-draw', (element: WhiteboardElement) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      room.whiteboardElements.push(element);
      socket.to(currentRoomCode).emit('whiteboard-draw', element);
    });

    // Collaborative Whiteboard: Clear canvas
    socket.on('whiteboard-clear', () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      room.whiteboardElements = [];
      io.to(currentRoomCode).emit('whiteboard-clear');
    });

    // Collaborative Whiteboard: Cursor position
    socket.on('whiteboard-cursor', ({ x, y }: { x: number; y: number }) => {
      if (!currentRoomCode || !currentUser) return;
      socket.to(currentRoomCode).emit('whiteboard-cursor', {
        userId: currentUser.userId,
        userName: currentUser.name,
        color: currentUser.avatar,
        x,
        y,
      });
    });

    // File sharing notification
    socket.on('file-share-start', (metadata: any) => {
      if (!currentRoomCode || !currentUser) return;
      socket.to(currentRoomCode).emit('file-share-incoming', {
        ...metadata,
        senderSocketId: socket.id,
        senderName: currentUser.name,
      });
    });

    // Disconnect cleanup
    const handleLeave = () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const participant = room.participants.get(socket.id);
      room.participants.delete(socket.id);
      socket.leave(currentRoomCode);

      if (participant) {
        console.log(`User ${participant.name} (${socket.id}) left room ${currentRoomCode}`);
        socket.to(currentRoomCode).emit('participant-left', {
          socketId: socket.id,
          name: participant.name,
        });

        const leaveMsg: ChatMessage = {
          id: uuidv4(),
          roomId: currentRoomCode,
          senderId: 'system',
          senderName: 'System',
          senderAvatar: '',
          text: `${participant.name} left the meeting`,
          timestamp: Date.now(),
          isSystem: true,
        };
        room.chatMessages.push(leaveMsg);
        io.to(currentRoomCode).emit('chat-message', leaveMsg);
      }

      if (room.participants.size === 0) {
        // Keep whiteboard state temporarily, remove after 10 min idle
        setTimeout(() => {
          const r = rooms.get(currentRoomCode!);
          if (r && r.participants.size === 0) {
            rooms.delete(currentRoomCode!);
          }
        }, 10 * 60 * 1000);
      }

      currentRoomCode = null;
      currentUser = null;
    };

    socket.on('leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};
