import fs from 'fs';
import path from 'path';
import { User, Room } from '../types';

interface MeetingRecord {
  id: string;
  userId: string;
  roomCode: string;
  roomTitle: string;
  role: 'host' | 'participant';
  joinedAt: string;
  durationMinutes?: number;
}

interface DatabaseSchema {
  users: User[];
  rooms: Room[];
  meetings: MeetingRecord[];
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData: DatabaseSchema = {
  users: [],
  rooms: [],
  meetings: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = defaultData;
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      this.data = defaultData;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // Users
  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // Rooms
  public findRoomByCode(code: string): Room | undefined {
    return this.data.rooms.find(r => r.code.toLowerCase() === code.toLowerCase());
  }

  public findRoomById(id: string): Room | undefined {
    return this.data.rooms.find(r => r.id === id);
  }

  public createRoom(room: Room): Room {
    this.data.rooms.push(room);
    this.save();
    return room;
  }

  public updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    const room = this.findRoomById(id);
    if (!room) return undefined;
    Object.assign(room, updates);
    this.save();
    return room;
  }

  // Meeting History
  public addMeetingRecord(record: MeetingRecord): MeetingRecord {
    this.data.meetings.push(record);
    this.save();
    return record;
  }

  public getUserMeetings(userId: string): MeetingRecord[] {
    return this.data.meetings
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 20);
  }
}

export const db = new Database();
