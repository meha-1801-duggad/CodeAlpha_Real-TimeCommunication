export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGuest?: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  hostName: string;
  hasPasscode: boolean;
  isLocked: boolean;
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
  isSpeaking?: boolean;
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
    dataUrl?: string;
  };
}

export interface ReactionEvent {
  id: string;
  senderName: string;
  emoji: string;
  timestamp: number;
}

export type WhiteboardTool = 'brush' | 'highlighter' | 'line' | 'arrow' | 'rect' | 'circle' | 'text' | 'eraser';

export interface WhiteboardElement {
  id: string;
  type: WhiteboardTool;
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

export interface DeviceSettings {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
}

export interface MeetingRecord {
  id: string;
  userId: string;
  roomCode: string;
  roomTitle: string;
  role: 'host' | 'participant';
  joinedAt: string;
  durationMinutes?: number;
}
