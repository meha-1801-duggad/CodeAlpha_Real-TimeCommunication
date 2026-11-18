import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Keyboard,
  Shield,
  PenTool,
  Share2,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
  User as UserIcon,
  ChevronRight,
  Monitor,
  Mic,
  Maximize2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuthModal } from '../components/auth/AuthModal';
import { MeetingRecord } from '../types';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [joinCode, setJoinCode] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'guest'>('login');

  // Create room modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingPasscode, setMeetingPasscode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Past meetings
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);

  // Time & Date widget
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch meeting history if logged in
  useEffect(() => {
    if (user && !user.isGuest) {
      api.getMeetingHistory()
        .then((res) => {
          if (res.success && res.meetings) {
            setMeetings(res.meetings);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleInstantMeeting = async () => {
    setIsCreating(true);
    try {
      const res = await api.createRoom({
        title: user ? `${user.name}'s Meeting` : 'Instant Conference',
      });
      if (res.success && res.room) {
        navigate(`/meet/${res.room.code}`);
      }
    } catch (err) {
      console.error('Instant meeting error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCustomMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await api.createRoom({
        title: meetingTitle.trim() || undefined,
        passcode: meetingPasscode.trim() || undefined,
      });
      if (res.success && res.room) {
        setIsCreateModalOpen(false);
        navigate(`/meet/${res.room.code}`);
      }
    } catch (err) {
      console.error('Create room error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    let code = joinCode.trim();
    if (code.includes('/meet/')) {
      code = code.split('/meet/')[1].split('?')[0];
    }
    navigate(`/meet/${code}`);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-100 flex flex-col relative overflow-hidden bg-radial-mesh">
      {/* Top Navbar */}
      <header className="relative z-30 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-white/[0.06] bg-obsidian-950/70 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center font-black text-white shadow-lg shadow-brand-500/25 border border-white/20">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">NexusMeet</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full hidden sm:inline">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-obsidian-400 hidden sm:block">Real-Time Collaboration Engine</p>
          </div>
        </div>

        {/* Live Clock & User Profile */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-mono font-bold tracking-wider text-obsidian-200">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[11px] text-obsidian-400">
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-white/[0.08] hidden md:block" />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase shadow-md ring-2 ring-white/[0.1]"
                  style={{ backgroundColor: user.avatar || '#6366F1' }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-obsidian-400 leading-tight">
                    {user.isGuest ? 'Guest User' : user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-obsidian-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-obsidian-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalTab('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all border border-brand-400/30"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero & Dashboard Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-16 py-10 lg:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Hero & Launch Deck (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <span>WebRTC Mesh 2.0 • Ultra-Low Latency • DTLS-SRTP</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                Video conferencing{' '}
                <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  built for high performance.
                </span>
              </h1>

              <p className="text-obsidian-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Seamless multi-user video calling with active speaker spotlight, real-time collaborative vector whiteboard, instant P2P file transfers, and in-browser local recording.
              </p>
            </div>

            {/* Quick Actions Deck */}
            <div className="flex flex-col sm:flex-row gap-3.5 max-w-xl">
              {/* Start Instant Meeting */}
              <div className="flex items-center gap-1.5 flex-1">
                <button
                  onClick={handleInstantMeeting}
                  disabled={isCreating}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-[0.98] text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl shadow-brand-500/25 border border-brand-400/30 disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Instant Meeting</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="py-3.5 px-3.5 rounded-2xl glass-panel hover:bg-obsidian-750 text-white transition-colors border border-white/[0.08]"
                  title="Schedule or lock with passcode"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Join with Code */}
              <form onSubmit={handleJoinMeeting} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Keyboard className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter meeting code"
                    className="w-full bg-obsidian-850/80 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="py-3 px-5 rounded-2xl glass-panel hover:bg-obsidian-700 disabled:opacity-40 text-white font-semibold text-sm transition-all border border-white/[0.08] active:scale-95"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Core Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2.5 text-xs text-obsidian-300">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 border border-emerald-500/20">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span>DTLS-SRTP Media Encryption</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-obsidian-300">
                <div className="w-7 h-7 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0 border border-brand-500/20">
                  <PenTool className="w-3.5 h-3.5" />
                </div>
                <span>Multiplayer Vector Canvas</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-obsidian-300">
                <div className="w-7 h-7 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 flex-shrink-0 border border-sky-500/20">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <span>P2P DataChannel Transfers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mock Preview or Recent Meetings (5 Cols) */}
          <div className="lg:col-span-5">
            {user && meetings.length > 0 ? (
              <div className="p-6 sm:p-7 rounded-3xl glass-panel shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <h3 className="font-bold text-white text-base">Recent Meetings</h3>
                  </div>
                  <span className="text-xs font-mono text-obsidian-400">{meetings.length} recorded</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {meetings.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-850/80 hover:bg-obsidian-800 border border-white/[0.06] transition-all group"
                    >
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-white truncate">{m.roomTitle}</p>
                        <p className="text-xs text-obsidian-400 font-mono mt-0.5">{m.roomCode}</p>
                      </div>

                      <button
                        onClick={() => navigate(`/meet/${m.roomCode}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/15 hover:bg-brand-600 text-brand-400 hover:text-white text-xs font-semibold transition-all group-hover:shadow-md"
                      >
                        <span>Rejoin</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Ultra-Sleek Conference Mockup Card */
              <div className="relative rounded-3xl glass-tile p-6 sm:p-8 shadow-2xl border border-white/[0.08] overflow-hidden space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-obsidian-200">
                      Live Conference Preview
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[11px] font-mono text-obsidian-300">
                    HD 1080p • 60fps
                  </span>
                </div>

                {/* Simulated Mini Video Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Speaker 1 (Active Speaker with Glow) */}
                  <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-obsidian-800 to-obsidian-750 border-2 border-brand-500 shadow-speaking p-3 flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white bg-brand-600 px-2 py-0.5 rounded-md">
                        Host
                      </span>
                      <div className="flex items-end gap-[2px] h-3 px-1">
                        <span className="w-1 bg-emerald-400 rounded-full animate-eq-1" />
                        <span className="w-1 bg-emerald-400 rounded-full animate-eq-2" />
                        <span className="w-1 bg-emerald-400 rounded-full animate-eq-3" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white">
                        A
                      </div>
                      <span className="text-xs font-semibold text-white">Alex (Speaking)</span>
                    </div>
                  </div>

                  {/* Speaker 2 */}
                  <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-obsidian-800 to-obsidian-750 border border-white/[0.08] p-3 flex flex-col justify-between overflow-hidden">
                    <div className="flex justify-end">
                      <Mic className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white">
                        S
                      </div>
                      <span className="text-xs font-semibold text-obsidian-200">Sarah</span>
                    </div>
                  </div>
                </div>

                {/* Key Technical Specs */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850/80 border border-white/[0.05] text-xs">
                    <span className="text-obsidian-300 font-medium">Signaling Protocol</span>
                    <span className="font-mono text-brand-400 font-semibold">WebSockets / Socket.IO</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850/80 border border-white/[0.05] text-xs">
                    <span className="text-obsidian-300 font-medium">Media Transport</span>
                    <span className="font-mono text-emerald-400 font-semibold">WebRTC DTLS-SRTP Mesh</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md glass-panel p-7 sm:p-8 rounded-3xl shadow-2xl border border-white/[0.1] space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Create Conference Room</h3>
              <p className="text-xs text-obsidian-400 mt-1">Configure meeting room parameters and security passcode</p>
            </div>

            <form onSubmit={handleCreateCustomMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-obsidian-300 mb-2">
                  Meeting Title (Optional)
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Design Sync & Sprint Review"
                  className="w-full bg-obsidian-850 border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-obsidian-300 mb-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Passcode Lock (Optional)</span>
                </label>
                <input
                  type="password"
                  value={meetingPasscode}
                  onChange={(e) => setMeetingPasscode(e.target.value)}
                  placeholder="Leave empty for open access"
                  className="w-full bg-obsidian-850 border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-obsidian-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 border border-brand-400/30"
                >
                  <span>Launch Conference</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
};
