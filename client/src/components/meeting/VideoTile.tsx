import React, { useRef, useEffect } from 'react';
import { MicOff, Pin, PinOff, PictureInPicture2, Maximize, Hand, MonitorUp } from 'lucide-react';
import { Participant } from '../../types';

interface VideoTileProps {
  participant: Participant;
  stream: MediaStream | null;
  isLocal?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  isSpeaking?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal = false,
  isPinned = false,
  onTogglePin,
  isSpeaking = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handlePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('PiP error:', err);
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const hasVideo = stream && !participant.isVideoOff && stream.getVideoTracks().some((t) => t.enabled);

  return (
    <div
      className={`group relative flex items-center justify-center w-full h-full min-h-[180px] bg-slate-900/90 rounded-2xl overflow-hidden border transition-all duration-200 ${
        isSpeaking ? 'speaking-glow border-brand-500' : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Video Stream Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video element to avoid audio feedback
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideo ? 'opacity-100' : 'opacity-0'
        } ${isLocal && !participant.isScreenSharing ? '-scale-x-100' : ''}`}
      />

      {/* Avatar Fallback when camera is off */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-xl ring-4 ring-slate-800 transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: participant.avatar || '#6366f1' }}
          >
            {participant.name.charAt(0).toUpperCase()}
          </div>
          <span className="mt-3 text-sm font-medium text-slate-300">{participant.name}</span>
        </div>
      )}

      {/* Top Badges & Quick Action Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {participant.isScreenSharing && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-brand-600/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg">
              <MonitorUp className="w-3.5 h-3.5" /> Presenting
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors ${
                isPinned ? 'bg-brand-600 text-white' : 'hover:bg-slate-800'
              }`}
              title={isPinned ? 'Unpin' : 'Pin to spotlight'}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handlePiP}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Hand Raise Notice */}
      {participant.isHandRaised && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs backdrop-blur-md shadow-lg animate-bounce z-10">
          <Hand className="w-3.5 h-3.5 fill-current" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Bottom Name Pill & Audio Status */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10">
        <span className="text-xs font-medium text-white truncate max-w-[140px]">
          {participant.name} {isLocal && '(You)'}
        </span>

        {participant.isMuted ? (
          <MicOff className="w-3.5 h-3.5 text-rose-400" />
        ) : isSpeaking ? (
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
