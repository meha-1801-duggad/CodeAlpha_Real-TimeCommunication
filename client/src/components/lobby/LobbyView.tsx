import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, ShieldCheck, Lock, ArrowRight, User as UserIcon, Sparkles } from 'lucide-react';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { api } from '../../services/api';

interface LobbyViewProps {
  roomCode: string;
  initialUserName: string;
  onJoin: (userName: string, stream: MediaStream | null, initialMuted: boolean, initialVideoOff: boolean) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomCode,
  initialUserName,
  onJoin,
}) => {
  const [userName, setUserName] = useState(initialUserName || '');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Room verification state
  const [roomTitle, setRoomTitle] = useState('Nexus Video Conference');
  const [hasPasscode, setHasPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { audioLevel } = useAudioAnalyzer(localStream, isMuted);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const initLobby = async () => {
      try {
        const roomRes = await api.getRoom(roomCode);
        if (roomRes.success && roomRes.room) {
          setRoomTitle(roomRes.room.title);
          setHasPasscode(roomRes.room.hasPasscode);
        }
      } catch (err) {
        console.error('Room check error:', err);
      } finally {
        setIsLoading(false);
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        activeStream = stream;
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Could not acquire media in lobby:', err);
      }
    };

    initLobby();

    return () => {
      // Don't kill stream here so it can pass smoothly to meeting
    };
  }, [roomCode]);

  const handleToggleVideo = () => {
    if (localStream) {
      const vTrack = localStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setIsVideoOff(!vTrack.enabled);
      }
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleToggleAudio = () => {
    if (localStream) {
      const aTrack = localStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setIsMuted(!aTrack.enabled);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleJoinClick = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      alert('Please enter your name to join the meeting');
      return;
    }

    if (hasPasscode) {
      setPasscodeError('');
      const res = await api.verifyPasscode(roomCode, passcode);
      if (!res.success || !res.verified) {
        setPasscodeError('Invalid meeting passcode');
        return;
      }
    }

    onJoin(userName.trim(), localStream, isMuted, isVideoOff);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-ambient-light bg-pearl-50 text-pearl-900 relative overflow-hidden select-none">
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Green Room Video Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center border border-pearl-300">
            {/* Live Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
                isVideoOff ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Video Off Fallback */}
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950">
                <div className="w-24 h-24 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl ring-4 ring-white/10">
                  {userName.charAt(0).toUpperCase() || <UserIcon className="w-10 h-10" />}
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-pearl-300">
                  Camera is turned off
                </p>
              </div>
            )}

            {/* Top Viewport Header */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-pearl-200 shadow-md">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-pearl-800">Hardware Ready</span>
            </div>

            {/* Bottom floating toggle controls */}
            <div className="absolute bottom-4 flex items-center gap-3 p-1.5 rounded-2xl glass-dock shadow-xl">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`p-3 rounded-xl transition-all active:scale-95 ${
                  isMuted
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-800 border border-pearl-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-rose-600" /> : <Mic className="w-5 h-5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={handleToggleVideo}
                className={`p-3 rounded-xl transition-all active:scale-95 ${
                  isVideoOff
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-800 border border-pearl-200'
                }`}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5 text-rose-600" /> : <Video className="w-5 h-5 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Precision Mic Level Indicator */}
          <div className="w-full mt-4 p-3 rounded-2xl bg-white border border-pearl-200/90 shadow-sm flex items-center gap-4">
            <span className="text-xs font-bold tracking-wide text-pearl-700">Microphone</span>
            <div className="flex-1 h-2 bg-pearl-100 rounded-full overflow-hidden border border-pearl-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500 transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-pearl-500 min-w-[32px] text-right">
              {audioLevel > 0 ? `${audioLevel}%` : 'Silent'}
            </span>
          </div>
        </div>

        {/* Right: Meeting Join Card (5 Cols) */}
        <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl bg-white border border-pearl-200/90 shadow-card space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </div>
            <h2 className="text-2xl font-black text-pearl-900 tracking-tight">{roomTitle}</h2>
            <p className="text-xs text-pearl-500 mt-1 font-medium">
              Meeting Code: <span className="font-mono text-pearl-800 font-bold">{roomCode}</span>
            </p>
          </div>

          <form onSubmit={handleJoinClick} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl px-4 py-3.5 text-sm text-pearl-900 placeholder-pearl-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-all"
              />
            </div>

            {hasPasscode && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Room Passcode</span>
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode to unlock"
                  required
                  className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl px-4 py-3.5 text-sm text-pearl-900 placeholder-pearl-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-all"
                />
                {passcodeError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-bold">{passcodeError}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 group"
            >
              <span>Join Meeting Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-4 border-t border-pearl-100 flex items-center justify-between text-xs text-pearl-500 font-medium">
            <span>Camera & Mic Ready</span>
            <span className="flex items-center gap-1 text-brand-600 font-bold">
              <Sparkles className="w-3 h-3" /> Ultra-low Latency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
