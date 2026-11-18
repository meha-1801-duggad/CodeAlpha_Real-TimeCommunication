import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, ShieldCheck, Lock, ArrowRight, User as UserIcon } from 'lucide-react';
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

  // Check room details & start camera/mic preview
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
      if (activeStream) {
        // don't stop tracks if we pass them to meeting, but if unmounting without join, stop them
      }
    };
  }, [roomCode]);

  // Toggle Video Track
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

  // Toggle Audio Track
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
      alert('Please enter your name to join');
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0D14] relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Video Preview Green Room (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                  {userName.charAt(0).toUpperCase() || <UserIcon className="w-8 h-8" />}
                </div>
                <p className="mt-3 text-sm text-slate-400 font-medium">Camera is turned off</p>
              </div>
            )}

            {/* Bottom floating preview controls */}
            <div className="absolute bottom-4 flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`p-3 rounded-xl transition-all ${
                  isMuted
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={handleToggleVideo}
                className={`p-3 rounded-xl transition-all ${
                  isVideoOff
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Microphone level meter under video */}
          <div className="w-full mt-4 flex items-center gap-3 px-2">
            <span className="text-xs text-slate-400 font-medium">Mic Level:</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Join Form & Room Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{roomTitle}</h2>
            <p className="text-xs text-slate-400 mt-1">Room Code: <span className="font-mono text-slate-300 font-bold">{roomCode}</span></p>
          </div>

          <form onSubmit={handleJoinClick} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {hasPasscode && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Room Passcode</span>
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
                />
                {passcodeError && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{passcodeError}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 group"
            >
              <span>Join Meeting Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
