import { User, Room, MeetingRecord } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ success: boolean; token: string; user: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async createGuest(name: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateProfile(updates: { name?: string; avatar?: string }): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Rooms
  async createRoom(data: { title?: string; passcode?: string; isLocked?: boolean }): Promise<{ success: boolean; room: Room }> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getRoom(code: string): Promise<{ success: boolean; room: Room; message?: string }> {
    const res = await fetch(`${API_BASE}/rooms/${code}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async verifyPasscode(code: string, passcode: string): Promise<{ success: boolean; verified: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/rooms/${code}/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ passcode }),
    });
    return res.json();
  },

  async getMeetingHistory(): Promise<{ success: boolean; meetings: MeetingRecord[] }> {
    const res = await fetch(`${API_BASE}/rooms/history`, {
      headers: getHeaders(),
    });
    return res.json();
  },
};
