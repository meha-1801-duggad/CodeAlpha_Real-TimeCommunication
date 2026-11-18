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
        title: user ? `${user.name}'s Meeting` : 'Instant Meeting',
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

    // Handle full URL or room code
    let code = joinCode.trim();
    if (code.includes('/meet/')) {
      code = code.split('/meet/')[1].split('?')[0];
    }
    navigate(`/meet/${code}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-brand-500/30">
            N
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">NexusMeet</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md ml-1 hidden sm:inline">
            Enterprise Pro
          </span>
        </div>

        {/* Live Clock & User Controls */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-white">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-xs text-slate-400">
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase shadow-md ring-2 ring-slate-800"
                  style={{ backgroundColor: user.avatar || '#6366f1' }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {user.isGuest ? 'Guest Session' : user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalTab('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 transition-all"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero & Action Buttons (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Next-Gen WebRTC Video & Collaboration</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Seamless meetings,{' '}
                <span className="bg-gradient-to-r from-brand-400 to-indigo-300 bg-clip-text text-transparent">
                  instant collaboration.
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                Connect teams with ultra-low latency multi-user video calling, real-time synchronized vector whiteboard, high-speed P2P file sharing, and built-in meeting recording.
              </p>
            </div>

            {/* Quick Actions (Create / Join) */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
              {/* New Meeting Dropdown Button */}
              <div className="flex items-center gap-1.5 flex-1">
                <button
                  onClick={handleInstantMeeting}
                  disabled={isCreating}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30 disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Instant Meeting</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="py-3.5 px-3 rounded-2xl bg-brand-700 hover:bg-brand-600 text-white transition-colors"
                  title="Schedule or create password-protected meeting"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Join with Code Form */}
              <form onSubmit={handleJoinMeeting} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Keyboard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter meeting code"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-sm transition-all border border-slate-700"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Core Capability Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <span>DTLS-SRTP Media Encryption</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                  <PenTool className="w-4 h-4" />
                </div>
                <span>Collaborative Whiteboard</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>Direct P2P File Sharing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Meetings or Feature Highlight Card (5 cols) */}
          <div className="lg:col-span-5">
            {user && meetings.length > 0 ? (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>Recent Meetings</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{meetings.length} recorded</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {meetings.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all group"
                    >
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-white truncate">{m.roomTitle}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{m.roomCode}</p>
                      </div>

                      <button
                        onClick={() => navigate(`/meet/${m.roomCode}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/10 hover:bg-brand-600 text-brand-400 hover:text-white text-xs font-semibold transition-all group-hover:shadow-md"
                      >
                        <span>Rejoin</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* High-End Feature Showcase Card */
              <div className="relative rounded-3xl p-8 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-6">
                  <Monitor className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Production-Ready Architecture</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Engineered with standard WebRTC RTCPeerConnection mesh, Socket.IO real-time event hub, Canvas vector synchronization, and client-side MediaRecorder capture.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-300 font-medium">Video / Audio Transport</span>
                    <span className="font-mono text-brand-400 font-semibold">WebRTC DTLS-SRTP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-300 font-medium">Signaling Gateway</span>
                    <span className="font-mono text-brand-400 font-semibold">Socket.IO / WebSockets</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-300 font-medium">Session Security</span>
                    <span className="font-mono text-brand-400 font-semibold">JWT & bcrypt Hashes</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Create Meeting Room</h3>
            <p className="text-xs text-slate-400 mb-5">Configure optional security passcode or meeting title</p>

            <form onSubmit={handleCreateCustomMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Meeting Title (Optional)
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Sprint Review & Retrospective"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Passcode Protection (Optional)</span>
                </label>
                <input
                  type="password"
                  value={meetingPasscode}
                  onChange={(e) => setMeetingPasscode(e.target.value)}
                  placeholder="Leave empty for open meeting"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Create & Launch</span>
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
