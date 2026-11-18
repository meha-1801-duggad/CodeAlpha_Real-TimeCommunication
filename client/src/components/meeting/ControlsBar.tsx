import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  PenTool,
  MessageSquare,
  Users,
  Smile,
  Hand,
  PhoneOff,
  CircleDot,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface ControlsBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isWhiteboardOpen: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isHandRaised: boolean;
  isRecording: boolean;
  recordingTime: string;
  unreadCount: number;
  participantCount: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleWhiteboard: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleHand: () => void;
  onToggleRecording: () => void;
  onSendReaction: (emoji: string) => void;
  onOpenSettings: () => void;
  onLeaveMeeting: () => void;
}

const REACTION_EMOJIS = ['👏', '❤️', '👍', '🎉', '😂', '💡', '🔥', '🚀'];

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isWhiteboardOpen,
  isChatOpen,
  isParticipantsOpen,
  isHandRaised,
  isRecording,
  recordingTime,
  unreadCount,
  participantCount,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleWhiteboard,
  onToggleChat,
  onToggleParticipants,
  onToggleHand,
  onToggleRecording,
  onSendReaction,
  onOpenSettings,
  onLeaveMeeting,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="relative z-30 px-4 py-3 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Meeting Status Badges */}
      <div className="hidden sm:flex items-center gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-850/90 border border-white/[0.08] backdrop-blur-xl shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-obsidian-100">Live Encrypted</span>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 backdrop-blur-xl shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-mono font-semibold text-rose-400">REC {recordingTime}</span>
          </div>
        )}
      </div>

      {/* Center: Main Floating Ergonomic Dock */}
      <div className="mx-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl glass-dock pointer-events-auto shadow-dock transition-all">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`group relative p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isMuted
              ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 shadow-inner'
              : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-100 border border-white/[0.06] hover:border-white/[0.12]'
          }`}
          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          <span className="sr-only">Toggle Mic</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          className={`group relative p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isVideoOff
              ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 shadow-inner'
              : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-100 border border-white/[0.06] hover:border-white/[0.12]'
          }`}
          title={isVideoOff ? 'Start Camera (V)' : 'Stop Camera (V)'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-emerald-400" />}
          <span className="sr-only">Toggle Camera</span>
        </button>

        <div className="w-[1px] h-6 bg-white/[0.08] mx-0.5 sm:mx-1" />

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isScreenSharing
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 border border-brand-400/30'
              : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-200 hover:text-white border border-white/[0.06]'
          }`}
          title={isScreenSharing ? 'Stop Sharing (D)' : 'Share Screen (D)'}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        </button>

        {/* Collaborative Whiteboard Toggle */}
        <button
          onClick={onToggleWhiteboard}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isWhiteboardOpen
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 border border-brand-400/30'
              : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-200 hover:text-white border border-white/[0.06]'
          }`}
          title="Collaborative Whiteboard"
        >
          <PenTool className="w-5 h-5" />
        </button>

        {/* Emoji Reactions */}
        <div className="relative">
          <button
            onClick={() => setShowReactions((prev) => !prev)}
            className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
              showReactions
                ? 'bg-obsidian-700 text-white border border-white/20'
                : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-200 hover:text-white border border-white/[0.06]'
            }`}
            title="Reactions"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 rounded-2xl glass-panel shadow-2xl z-40 animate-slide-up">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactions(false);
                  }}
                  className="p-2 text-xl hover:scale-125 transition-transform rounded-xl hover:bg-white/[0.08]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hand Raise */}
        <button
          onClick={onToggleHand}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isHandRaised
              ? 'bg-amber-400 text-obsidian-950 font-bold shadow-lg shadow-amber-400/30 border border-amber-300'
              : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-200 hover:text-white border border-white/[0.06]'
          }`}
          title={isHandRaised ? 'Lower Hand (H)' : 'Raise Hand (H)'}
        >
          <Hand className={`w-5 h-5 ${isHandRaised ? 'fill-current' : ''}`} />
        </button>

        {/* Local Recording */}
        <button
          onClick={onToggleRecording}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isRecording
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400'
              : 'bg-obsidian-750/80 hover:bg-obsidian-700 text-obsidian-200 hover:text-white border border-white/[0.06]'
          }`}
          title={isRecording ? 'Stop Recording' : 'Record Session Locally'}
        >
          <CircleDot className="w-5 h-5" />
        </button>

        <div className="w-[1px] h-6 bg-white/[0.08] mx-0.5 sm:mx-1" />

        {/* End Call Button */}
        <button
          onClick={onLeaveMeeting}
          className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 border border-rose-400/30"
          title="Leave Meeting"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden md:inline font-semibold">End</span>
        </button>
      </div>

      {/* Right: Drawer Toggles (Chat, Participants, Settings) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
            isChatOpen
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30'
              : 'glass-panel text-obsidian-200 hover:text-white hover:bg-obsidian-700/80'
          }`}
          title="Meeting Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-obsidian-950 shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Participants Drawer Toggle */}
        <button
          onClick={onToggleParticipants}
          className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
            isParticipantsOpen
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30'
              : 'glass-panel text-obsidian-200 hover:text-white hover:bg-obsidian-700/80'
          }`}
          title="Participants"
        >
          <Users className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-obsidian-750 text-obsidian-200 border border-white/[0.08] text-[10px] font-mono font-semibold ring-2 ring-obsidian-950">
            {participantCount}
          </span>
        </button>

        {/* Hardware Settings Modal */}
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-2xl glass-panel text-obsidian-200 hover:text-white hover:bg-obsidian-700/80 transition-all active:scale-95"
          title="Hardware Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
