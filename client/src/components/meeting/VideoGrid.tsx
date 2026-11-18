import React, { useState } from 'react';
import { Participant } from '../../types';
import { VideoTile } from './VideoTile';

interface VideoGridProps {
  localParticipant: Participant;
  localStream: MediaStream | null;
  remoteParticipants: Participant[];
  remoteStreams: Map<string, MediaStream>;
  speakingSocketIds: Set<string>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localParticipant,
  localStream,
  remoteParticipants,
  remoteStreams,
  speakingSocketIds,
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const allParticipants = [localParticipant, ...remoteParticipants];

  // Check if someone is actively screen sharing (auto-pin screen share)
  const screenSharer = allParticipants.find((p) => p.isScreenSharing);
  const activeFocusId = pinnedId || (screenSharer ? screenSharer.socketId : null);

  const getStreamForParticipant = (p: Participant): MediaStream | null => {
    if (p.socketId === localParticipant.socketId) {
      return localStream;
    }
    return remoteStreams.get(p.socketId) || null;
  };

  // Determine grid template classes based on participant count
  const getGridClasses = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-4xl max-h-[80vh]';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 max-w-7xl';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl';
  };

  // Spotlight Mode (when pinned or screen sharing)
  if (activeFocusId) {
    const focusParticipant = allParticipants.find((p) => p.socketId === activeFocusId) || allParticipants[0];
    const otherParticipants = allParticipants.filter((p) => p.socketId !== activeFocusId);

    return (
      <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 overflow-hidden">
        {/* Main Spotlight Stage */}
        <div className="flex-1 h-full min-h-[360px] rounded-2xl overflow-hidden shadow-2xl">
          <VideoTile
            participant={focusParticipant}
            stream={getStreamForParticipant(focusParticipant)}
            isLocal={focusParticipant.socketId === localParticipant.socketId}
            isPinned={true}
            onTogglePin={() => setPinnedId(null)}
            isSpeaking={speakingSocketIds.has(focusParticipant.socketId)}
          />
        </div>

        {/* Thumbnail Filmstrip for other participants */}
        {otherParticipants.length > 0 && (
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-72 max-h-[220px] lg:max-h-full flex-shrink-0">
            {otherParticipants.map((p) => (
              <div key={p.socketId} className="w-52 lg:w-full h-32 lg:h-44 flex-shrink-0">
                <VideoTile
                  participant={p}
                  stream={getStreamForParticipant(p)}
                  isLocal={p.socketId === localParticipant.socketId}
                  isPinned={false}
                  onTogglePin={() => setPinnedId(p.socketId)}
                  isSpeaking={speakingSocketIds.has(p.socketId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard Auto-Balanced Grid Mode
  return (
    <div className="flex items-center justify-center h-full w-full p-4 overflow-hidden">
      <div
        className={`grid gap-4 w-full h-full items-center justify-center auto-rows-fr ${getGridClasses(
          allParticipants.length
        )}`}
      >
        {allParticipants.map((p) => (
          <div key={p.socketId} className="w-full h-full min-h-[220px]">
            <VideoTile
              participant={p}
              stream={getStreamForParticipant(p)}
              isLocal={p.socketId === localParticipant.socketId}
              isPinned={false}
              onTogglePin={() => setPinnedId(p.socketId)}
              isSpeaking={speakingSocketIds.has(p.socketId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
