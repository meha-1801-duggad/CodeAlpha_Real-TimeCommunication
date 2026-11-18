export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  isGuest?: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  hostId: string;
  hostName: string;
  passcodeHash?: string | null;
  isLocked: boolean;
  maxParticipants: number;
  createdAt: string;
}

export interface Participant {
  socketId: string;
  userId: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  handRaisedAt?: number;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  file?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
}

export interface WhiteboardElement {
  id: string;
  type: 'brush' | 'highlighter' | 'line' | 'arrow' | 'rect' | 'circle' | 'text' | 'eraser';
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  userId: string;
}

export interface WhiteboardCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}
