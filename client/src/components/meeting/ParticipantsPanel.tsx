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
    <div className="flex flex-col h-full w-full glass-panel border-l border-white/[0.08] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-obsidian-900/60 backdrop-blur-xl">
        <div>
          <h3 className="font-bold text-white text-sm tracking-wide">Participants ({participants.length})</h3>
          <p className="text-[11px] font-mono text-obsidian-400">Room: {roomCode}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-obsidian-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Copy Invite Link Card */}
      <div className="p-4 border-b border-white/[0.06] bg-obsidian-950/40">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600/10 hover:bg-brand-600/20 text-brand-300 border border-brand-500/25 transition-all font-semibold text-xs shadow-sm active:scale-98"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Invite Link Copied to Clipboard!' : 'Copy Meeting Invite Link'}</span>
        </button>
      </div>

      {/* Raised Hands Queue */}
      {handRaisedParticipants.length > 0 && (
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
            <Hand className="w-4 h-4" />
            <span>Hands Raised ({handRaisedParticipants.length})</span>
          </div>
          <div className="space-y-1.5">
            {handRaisedParticipants.map((p) => (
              <div key={p.socketId} className="flex items-center justify-between text-xs text-obsidian-200">
                <span className="truncate font-medium">{p.name}</span>
                <span className="text-[10px] font-mono text-amber-400/90">waiting to speak</span>
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
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0 shadow-md ring-2 ring-white/[0.08]"
                  style={{ backgroundColor: p.avatar || '#6366F1' }}
                >
                  {p.name.charAt(0)}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                    {isMe && (
                      <span className="text-[10px] text-brand-300 font-bold px-1.5 py-0.2 rounded bg-brand-500/20 border border-brand-500/30">
                        You
                      </span>
                    )}
                    {p.isHost && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                  {p.isHandRaised && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium mt-0.5">
                      <Hand className="w-3 h-3" /> Raised Hand
                    </span>
                  )}
                </div>
              </div>

              {/* Media Status Icons */}
              <div className="flex items-center gap-2 text-obsidian-400">
                {p.isMuted ? (
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                    <MicOff className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                )}

                {p.isVideoOff ? (
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                    <VideoOff className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
