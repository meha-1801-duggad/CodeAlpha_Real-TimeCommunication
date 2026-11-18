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
    <div className="relative flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 z-20">
      {/* Left: Recording status & Room timer */}
      <div className="flex items-center gap-3">
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>REC {recordingTime}</span>
          </div>
        )}
      </div>

      {/* Center: Core Audio, Video, Screen, Whiteboard, Reactions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-3.5 rounded-2xl transition-all duration-200 ${
            isMuted
              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3.5 rounded-2xl transition-all duration-200 ${
            isVideoOff
              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title={isVideoOff ? 'Start Video (V)' : 'Stop Video (V)'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3.5 rounded-2xl transition-all duration-200 ${
            isScreenSharing
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title={isScreenSharing ? 'Stop Presenting (D)' : 'Share Screen (D)'}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        </button>

        {/* Collaborative Whiteboard Toggle */}
        <button
          onClick={onToggleWhiteboard}
          className={`p-3.5 rounded-2xl transition-all duration-200 ${
            isWhiteboardOpen
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Collaborative Whiteboard"
        >
          <PenTool className="w-5 h-5" />
        </button>

        {/* Emoji Reactions Popover */}
        <div className="relative">
          <button
            onClick={() => setShowReactions((prev) => !prev)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Reactions"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-30 animate-slide-up">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactions(false);
                  }}
                  className="p-2 text-xl hover:scale-130 transition-transform rounded-xl hover:bg-slate-700/60"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Raise Hand Toggle */}
        <button
          onClick={onToggleHand}
          className={`p-3.5 rounded-2xl transition-all duration-200 ${
            isHandRaised
              ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand className={`w-5 h-5 ${isHandRaised ? 'fill-current' : ''}`} />
        </button>

        {/* Meeting Recorder Toggle */}
        <button
          onClick={onToggleRecording}
          className={`p-3.5 rounded-2xl transition-all duration-200 ${
            isRecording
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title={isRecording ? 'Stop Recording' : 'Record Meeting (.webm)'}
        >
          <CircleDot className="w-5 h-5" />
        </button>

        {/* Leave Call Button */}
        <button
          onClick={onLeaveMeeting}
          className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-rose-600/20"
          title="Leave Meeting"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Leave</span>
        </button>
      </div>

      {/* Right: Side panel toggles (Chat, Participants, Settings) */}
      <div className="flex items-center gap-2">
        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative p-3 rounded-xl transition-all ${
            isChatOpen
              ? 'bg-brand-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Meeting Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Participants Toggle */}
        <button
          onClick={onToggleParticipants}
          className={`relative p-3 rounded-xl transition-all ${
            isParticipantsOpen
              ? 'bg-brand-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Participants"
        >
          <Users className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-semibold ring-2 ring-slate-900">
            {participantCount}
          </span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          title="Audio & Video Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
