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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-pearl-200/90 backdrop-blur-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-pearl-800">Live Encrypted</span>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 backdrop-blur-xl shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span className="text-xs font-mono font-bold text-rose-700">REC {recordingTime}</span>
          </div>
        )}
      </div>

      {/* Center: Main Floating Light Dock */}
      <div className="mx-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl glass-dock shadow-dock pointer-events-auto transition-all">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`group relative p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isMuted
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-xs'
              : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-800 border border-pearl-200 shadow-xs'
          }`}
          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {isMuted ? <MicOff className="w-5 h-5 text-rose-600" /> : <Mic className="w-5 h-5 text-emerald-600" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          className={`group relative p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isVideoOff
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-xs'
              : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-800 border border-pearl-200 shadow-xs'
          }`}
          title={isVideoOff ? 'Start Camera (V)' : 'Stop Camera (V)'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5 text-rose-600" /> : <Video className="w-5 h-5 text-emerald-600" />}
        </button>

        <div className="w-[1px] h-6 bg-pearl-200 mx-0.5 sm:mx-1" />

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 ${
            isScreenSharing
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 border border-brand-500'
              : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-700 border border-pearl-200 shadow-xs'
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
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 border border-brand-500'
              : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-700 border border-pearl-200 shadow-xs'
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
                ? 'bg-pearl-200 text-pearl-900 border border-pearl-300'
                : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-700 border border-pearl-200 shadow-xs'
            }`}
            title="Reactions"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 rounded-2xl bg-white border border-pearl-200 shadow-xl z-40 animate-slide-up">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactions(false);
                  }}
                  className="p-2 text-xl hover:scale-125 transition-transform rounded-xl hover:bg-pearl-100"
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
              ? 'bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-400/25 border border-amber-300'
              : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-700 border border-pearl-200 shadow-xs'
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
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 border border-rose-500'
              : 'bg-pearl-100 hover:bg-pearl-200 text-pearl-700 border border-pearl-200 shadow-xs'
          }`}
          title={isRecording ? 'Stop Recording' : 'Record Session Locally'}
        >
          <CircleDot className="w-5 h-5" />
        </button>

        <div className="w-[1px] h-6 bg-pearl-200 mx-0.5 sm:mx-1" />

        {/* End Call Button */}
        <button
          onClick={onLeaveMeeting}
          className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all duration-200 flex items-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 border border-rose-500"
          title="Leave Meeting"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden md:inline font-bold">End</span>
        </button>
      </div>

      {/* Right: Drawer Toggles */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
            isChatOpen
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 border border-brand-500'
              : 'bg-white hover:bg-pearl-100 text-pearl-700 border border-pearl-200 shadow-xs'
          }`}
          title="Meeting Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Participants Drawer Toggle */}
        <button
          onClick={onToggleParticipants}
          className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
            isParticipantsOpen
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 border border-brand-500'
              : 'bg-white hover:bg-pearl-100 text-pearl-700 border border-pearl-200 shadow-xs'
          }`}
          title="Participants"
        >
          <Users className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-pearl-200 text-pearl-800 text-[10px] font-mono font-bold ring-2 ring-white">
            {participantCount}
          </span>
        </button>

        {/* Hardware Settings Modal */}
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-2xl bg-white hover:bg-pearl-100 text-pearl-700 border border-pearl-200 shadow-xs transition-all active:scale-95"
          title="Hardware Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
