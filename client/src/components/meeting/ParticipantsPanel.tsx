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
    <div className="flex flex-col h-full w-full bg-white border-l border-pearl-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-pearl-200/90 bg-white/90 backdrop-blur-xl">
        <div>
          <h3 className="font-extrabold text-pearl-900 text-sm tracking-wide">Participants ({participants.length})</h3>
          <p className="text-[11px] font-mono text-pearl-500 font-medium">Room: {roomCode}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-pearl-400 hover:text-pearl-800 hover:bg-pearl-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Copy Invite Link Card */}
      <div className="p-4 border-b border-pearl-100 bg-pearl-50/60">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-all font-bold text-xs shadow-xs active:scale-98"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Invite Link Copied to Clipboard!' : 'Copy Meeting Invite Link'}</span>
        </button>
      </div>

      {/* Raised Hands Queue */}
      {handRaisedParticipants.length > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
            <Hand className="w-4 h-4 text-amber-600" />
            <span>Hands Raised ({handRaisedParticipants.length})</span>
          </div>
          <div className="space-y-1.5">
            {handRaisedParticipants.map((p) => (
              <div key={p.socketId} className="flex items-center justify-between text-xs text-pearl-700">
                <span className="truncate font-semibold">{p.name}</span>
                <span className="text-[10px] font-mono font-bold text-amber-700">waiting to speak</span>
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
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-pearl-50 transition-colors border border-transparent hover:border-pearl-200"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0 shadow-xs ring-2 ring-pearl-200"
                  style={{ backgroundColor: p.avatar || '#2563EB' }}
                >
                  {p.name.charAt(0)}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-pearl-900 truncate">{p.name}</span>
                    {isMe && (
                      <span className="text-[10px] text-brand-700 font-bold px-1.5 py-0.2 rounded bg-brand-50 border border-brand-200">
                        You
                      </span>
                    )}
                    {p.isHost && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                  {p.isHandRaised && (
                    <span className="text-[10px] text-amber-700 flex items-center gap-1 font-semibold mt-0.5">
                      <Hand className="w-3 h-3 text-amber-600" /> Raised Hand
                    </span>
                  )}
                </div>
              </div>

              {/* Media Status Icons */}
              <div className="flex items-center gap-2 text-pearl-500">
                {p.isMuted ? (
                  <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200">
                    <MicOff className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                )}

                {p.isVideoOff ? (
                  <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200">
                    <VideoOff className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
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
