import React, { useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Hand, Copy, Check, ShieldCheck } from 'lucide-react';
import { Participant } from '../../types';

interface ParticipantsPanelProps {
  participants: Participant[];
  currentUserId: string;
  isHost: boolean;
  roomCode: string;
  onClose: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentUserId,
  isHost,
  roomCode,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/meet/${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handRaisedParticipants = participants.filter((p) => p.isHandRaised);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 border-l border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div>
          <h3 className="font-semibold text-white text-base">Participants ({participants.length})</h3>
          <p className="text-xs text-slate-400">Meeting Room: {roomCode}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Copy Invite Link Card */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600/10 hover:bg-brand-600/20 text-brand-400 border border-brand-500/20 transition-all font-medium text-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Invite Link Copied!' : 'Copy Meeting Invite Link'}</span>
        </button>
      </div>

      {/* Raised Hands Queue */}
      {handRaisedParticipants.length > 0 && (
        <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
            <Hand className="w-4 h-4" />
            <span>Hands Raised ({handRaisedParticipants.length})</span>
          </div>
          <div className="space-y-1.5">
            {handRaisedParticipants.map((p) => (
              <div key={p.socketId} className="flex items-center justify-between text-xs text-slate-300">
                <span className="truncate">{p.name}</span>
                <span className="text-[10px] text-amber-400/80">waiting to speak</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((p) => {
          const isMe = p.userId === currentUserId;

          return (
            <div
              key={p.socketId}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-800"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0"
                  style={{ backgroundColor: p.avatar || '#6366f1' }}
                >
                  {p.name.charAt(0)}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-white truncate">{p.name}</span>
                    {isMe && (
                      <span className="text-[10px] text-brand-400 font-semibold px-1.5 py-0.2 rounded bg-brand-500/10">
                        You
                      </span>
                    )}
                    {p.isHost && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10">
                        <ShieldCheck className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                  {p.isHandRaised && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Hand className="w-3 h-3" /> Raised Hand
                    </span>
                  )}
                </div>
              </div>

              {/* Media Status Icons */}
              <div className="flex items-center gap-1.5 text-slate-400">
                {p.isMuted ? (
                  <MicOff className="w-4 h-4 text-rose-400" />
                ) : (
                  <Mic className="w-4 h-4 text-emerald-400" />
                )}

                {p.isVideoOff ? (
                  <VideoOff className="w-4 h-4 text-rose-400" />
                ) : (
                  <Video className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
