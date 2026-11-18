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
      className={`group relative flex items-center justify-center w-full h-full min-h-[190px] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-tile ${
        isSpeaking
          ? 'speaking-glow ring-3 ring-brand-600'
          : 'border border-pearl-200 hover:border-pearl-300'
      } bg-slate-900`}
    >
      {/* Real Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video element to avoid microphone echo
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideo ? 'opacity-100' : 'opacity-0'
        } ${isLocal && !participant.isScreenSharing ? '-scale-x-100' : ''}`}
      />

      {/* Elegant Avatar Fallback when camera is disabled */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950">
          <div className="relative">
            {/* Ambient Avatar Glow */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-35"
              style={{ backgroundColor: participant.avatar || '#2563EB' }}
            />
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white shadow-2xl ring-4 ring-white/10 transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: participant.avatar || '#2563EB' }}
            >
              {participant.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <span className="mt-3.5 text-sm font-bold tracking-wide text-white">
            {participant.name}
          </span>
        </div>
      )}

      {/* Top Bar Actions & Status Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {participant.isScreenSharing && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 px-3 py-1 rounded-full shadow-md border border-brand-400">
              <MonitorUp className="w-3.5 h-3.5" /> Presenting
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 backdrop-blur-xl border border-pearl-200 shadow-md pointer-events-auto">
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-xl transition-colors ${
                isPinned ? 'bg-brand-600 text-white shadow-xs' : 'text-pearl-600 hover:text-pearl-900 hover:bg-pearl-100'
              }`}
              title={isPinned ? 'Unpin' : 'Pin Spotlight'}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handlePiP}
            className="p-1.5 rounded-xl text-pearl-600 hover:text-pearl-900 hover:bg-pearl-100 transition-colors"
            title="Picture-in-Picture"
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-xl text-pearl-600 hover:text-pearl-900 hover:bg-pearl-100 transition-colors"
            title="Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Raised Hand Floating Badge */}
      {participant.isHandRaised && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-amber-950 font-bold text-xs backdrop-blur-md shadow-lg animate-bounce z-20 border border-amber-300">
          <Hand className="w-3.5 h-3.5 fill-current" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Bottom Name Pill & Audio Equalizer Indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-pearl-200 shadow-md z-20">
        <span className="text-xs font-bold tracking-wide text-pearl-900 truncate max-w-[150px]">
          {participant.name} {isLocal && '(You)'}
        </span>

        {participant.isMuted ? (
          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-100 text-rose-600">
            <MicOff className="w-3 h-3" />
          </div>
        ) : isSpeaking ? (
          /* Animated 3-Bar Audio Equalizer */
          <div className="flex items-end gap-[2px] h-3.5 px-0.5">
            <span className="w-[3px] bg-emerald-600 rounded-full animate-eq-1" />
            <span className="w-[3px] bg-emerald-600 rounded-full animate-eq-2" />
            <span className="w-[3px] bg-emerald-600 rounded-full animate-eq-3" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
