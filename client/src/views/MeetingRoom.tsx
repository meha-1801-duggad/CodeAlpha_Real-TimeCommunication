import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { useMeetingRecorder } from '../hooks/useMeetingRecorder';
import { sound } from '../services/soundService';
import { Participant, ChatMessage, WhiteboardElement, ReactionEvent } from '../types';

import { LobbyView } from '../components/lobby/LobbyView';
import { VideoGrid } from '../components/meeting/VideoGrid';
import { ControlsBar } from '../components/meeting/ControlsBar';
import { WhiteboardPanel } from '../components/whiteboard/WhiteboardPanel';
import { ChatPanel } from '../components/chat/ChatPanel';
import { ParticipantsPanel } from '../components/meeting/ParticipantsPanel';
import { SettingsModal } from '../components/settings/SettingsModal';
import { ShieldCheck, Copy, Check } from 'lucide-react';

export const MeetingRoom: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Meeting states
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Participants
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
  const [speakingSocketIds, setSpeakingSocketIds] = useState<Set<string>>(new Set());

  // Panels
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isWhiteboardMaximized, setIsWhiteboardMaximized] = useState(false);
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Reactions & link copy
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  // Local Meeting Recorder
  const { isRecording, formattedTime, startRecording, stopRecording } = useMeetingRecorder();

  // Incoming P2P file callback
  const handleFileReceived = useCallback((file: { name: string; size: number; type: string; dataUrl: string }) => {
    sound.playMessageSound();
    const fileMsg: ChatMessage = {
      id: `p2p_${Date.now()}`,
      roomId: code || '',
      senderId: 'remote',
      senderName: 'Peer (P2P Direct)',
      senderAvatar: '#10b981',
      text: `Sent a file via direct WebRTC DataChannel`,
      timestamp: Date.now(),
      file,
    };
    setChatMessages((prev) => [...prev, fileMsg]);
  }, [code]);

  // WebRTC Hook
  const { remoteStreams, switchVideoTrack, sendFileP2P } = useWebRTC({
    socket,
    localStream,
    onFileReceived: handleFileReceived,
  });

  // Local Audio Analyzer for Active Speaker Detection
  const handleSpeakingChange = useCallback((isSpeaking: boolean) => {
    if (socket && hasJoinedLobby) {
      socket.emit('speaking-state', { isSpeaking });
    }
  }, [socket, hasJoinedLobby]);

  useAudioAnalyzer(localStream, isMuted, handleSpeakingChange);

  // Lobby Join Handler
  const handleLobbyJoin = (
    chosenName: string,
    stream: MediaStream | null,
    initialMuted: boolean,
    initialVideoOff: boolean
  ) => {
    setLocalStream(stream);
    setIsMuted(initialMuted);
    setIsVideoOff(initialVideoOff);

    if (socket && isConnected) {
      socket.emit('join-room', {
        roomCode: code,
        user: {
          id: user?.id || `user_${Date.now()}`,
          name: chosenName,
          avatar: user?.avatar || '#6366f1',
        },
      });
    }

    setHasJoinedLobby(true);
    sound.playJoinSound();
  };

  // Socket event listeners for Room updates
  useEffect(() => {
    if (!socket || !hasJoinedLobby) return;

    // Initial state after joining
    socket.on('room-joined', ({ myParticipant: me, existingParticipants, whiteboardElements: wb, chatHistory }: any) => {
      setMyParticipant(me);
      setRemoteParticipants(existingParticipants);
      if (wb) setWhiteboardElements(wb);
      if (chatHistory) setChatMessages(chatHistory);
    });

    // New participant joined
    socket.on('participant-joined', (participant: Participant) => {
      sound.playJoinSound();
      setRemoteParticipants((prev) => {
        if (prev.some((p) => p.socketId === participant.socketId)) return prev;
        return [...prev, participant];
      });
    });

    // Participant left
    socket.on('participant-left', ({ socketId }: { socketId: string }) => {
      sound.playLeaveSound();
      setRemoteParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      setSpeakingSocketIds((prev) => {
        const updated = new Set(prev);
        updated.delete(socketId);
        return updated;
      });
    });

    // Remote participant changed media state (mic, cam, screen)
    socket.on('participant-media-changed', ({ socketId, isMuted: m, isVideoOff: v, isScreenSharing: s }: any) => {
      setRemoteParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isMuted: m, isVideoOff: v, isScreenSharing: s } : p))
      );
    });

    // Remote participant speaking state
    socket.on('participant-speaking', ({ socketId, isSpeaking }: { socketId: string; isSpeaking: boolean }) => {
      setSpeakingSocketIds((prev) => {
        const updated = new Set(prev);
        if (isSpeaking) {
          updated.add(socketId);
        } else {
          updated.delete(socketId);
        }
        return updated;
      });
    });

    // Remote participant hand raise
    socket.on('participant-hand-toggled', ({ socketId, isHandRaised, handRaisedAt }: any) => {
      if (isHandRaised) sound.playHandRaiseSound();
      setRemoteParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised, handRaisedAt } : p))
      );
    });

    // Chat message received
    socket.on('chat-message', (msg: ChatMessage) => {
      sound.playMessageSound();
      setChatMessages((prev) => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    // Emoji reaction broadcast
    socket.on('reaction-received', (reaction: ReactionEvent) => {
      setReactions((prev) => [...prev, reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 2500);
    });

    return () => {
      socket.off('room-joined');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('participant-media-changed');
      socket.off('participant-speaking');
      socket.off('participant-hand-toggled');
      socket.off('chat-message');
      socket.off('reaction-received');
    };
  }, [socket, hasJoinedLobby, isChatOpen]);

  // Audio mute toggle
  const handleToggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsMuted(newMuted);

        if (socket) {
          socket.emit('media-toggle', {
            isMuted: newMuted,
            isVideoOff,
            isScreenSharing,
          });
        }
      }
    }
  };

  // Video on/off toggle
  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoOff = !videoTrack.enabled;
        setIsVideoOff(newVideoOff);

        if (socket) {
          socket.emit('media-toggle', {
            isMuted,
            isVideoOff: newVideoOff,
            isScreenSharing,
          });
        }
      }
    }
  };

  // Screen share toggle
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      // Switch WebRTC peer tracks back to local camera track
      if (localStream) {
        const cameraTrack = localStream.getVideoTracks()[0] || null;
        switchVideoTrack(cameraTrack);
      }

      setIsScreenSharing(false);
      if (socket) {
        socket.emit('media-toggle', {
          isMuted,
          isVideoOff,
          isScreenSharing: false,
        });
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace track across all WebRTC peer connections
        switchVideoTrack(screenTrack);
        setIsScreenSharing(true);

        if (socket) {
          socket.emit('media-toggle', {
            isMuted,
            isVideoOff,
            isScreenSharing: true,
          });
        }

        // When user stops sharing using browser UI bar
        screenTrack.onended = () => {
          if (localStream) {
            const camTrack = localStream.getVideoTracks()[0] || null;
            switchVideoTrack(camTrack);
          }
          setIsScreenSharing(false);
          if (socket) {
            socket.emit('media-toggle', {
              isMuted,
              isVideoOff,
              isScreenSharing: false,
            });
          }
        };
      } catch (err) {
        console.error('Error starting screen share:', err);
      }
    }
  };

  // Hand raise toggle
  const handleToggleHand = () => {
    if (!myParticipant || !socket) return;
    const newHandState = !myParticipant.isHandRaised;
    setMyParticipant((prev) => (prev ? { ...prev, isHandRaised: newHandState } : null));

    if (newHandState) sound.playHandRaiseSound();
    socket.emit('raise-hand', { isHandRaised: newHandState });
  };

  // Reaction send
  const handleSendReaction = (emoji: string) => {
    if (socket) {
      socket.emit('send-reaction', { emoji });
    }
  };

  // Send File via WebRTC DataChannel + Chat broadcast
  const handleSendFile = (file: File) => {
    const fileId = `file_${Date.now()}`;

    // Read as DataURL for chat attachment
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Broadcast file info into room chat
      if (socket) {
        socket.emit('chat-message', {
          text: `Shared file: ${file.name}`,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
          },
        });
      }

      // Also transmit binary slices directly through WebRTC DataChannels!
      sendFileP2P(file, fileId);
    };
    reader.readAsDataURL(file);
  };

  // Copy Room Link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Leave Meeting
  const handleLeaveMeeting = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (socket) {
        socket.emit('leave-room');
      }
      navigate('/');
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    if (!hasJoinedLobby) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMic();
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleToggleVideo();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleToggleScreenShare();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleToggleHand();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasJoinedLobby, localStream, isMuted, isVideoOff, isScreenSharing]);

  // Show Pre-Join Lobby first
  if (!hasJoinedLobby) {
    return (
      <LobbyView
        roomCode={code || ''}
        initialUserName={user?.name || ''}
        onJoin={handleLobbyJoin}
      />
    );
  }

  const effectiveMyParticipant: Participant = myParticipant || {
    socketId: socket?.id || 'local',
    userId: user?.id || 'local_user',
    name: user?.name || 'You',
    avatar: user?.avatar || '#6366f1',
    isHost: false,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised: false,
    joinedAt: Date.now(),
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0D14] overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              N
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">NexusMeet</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

          {/* Meeting Room Code Pill */}
          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            title="Click to copy invite link"
          >
            <span>{code}</span>
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        {/* Security Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">DTLS-SRTP Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Area (Video Grid + Whiteboard + Side Panels) */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Floating Animated Reaction Emojis */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
          {reactions.map((r) => (
            <div key={r.id} className="animate-float-reaction flex flex-col items-center mb-2">
              <span className="text-4xl">{r.emoji}</span>
              <span className="text-[10px] font-semibold text-white/90 bg-slate-900/80 px-2 py-0.5 rounded-full mt-1">
                {r.senderName}
              </span>
            </div>
          ))}
        </div>

        {/* Left / Center: Video Grid or Split Whiteboard */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* If Whiteboard is maximized */}
          {isWhiteboardOpen && isWhiteboardMaximized ? (
            <div className="h-full w-full p-3">
              <WhiteboardPanel
                socket={socket}
                roomCode={code || ''}
                userId={effectiveMyParticipant.userId}
                userName={effectiveMyParticipant.name}
                userColor={effectiveMyParticipant.avatar}
                initialElements={whiteboardElements}
                onClose={() => setIsWhiteboardOpen(false)}
                isMaximized={isWhiteboardMaximized}
                onToggleMaximize={() => setIsWhiteboardMaximized(false)}
              />
            </div>
          ) : isWhiteboardOpen ? (
            /* Split View: Whiteboard on left/top, Video Grid on right/bottom */
            <div className="flex flex-col lg:flex-row h-full w-full p-3 gap-3">
              <div className="flex-1 h-full min-h-[300px]">
                <WhiteboardPanel
                  socket={socket}
                  roomCode={code || ''}
                  userId={effectiveMyParticipant.userId}
                  userName={effectiveMyParticipant.name}
                  userColor={effectiveMyParticipant.avatar}
                  initialElements={whiteboardElements}
                  onClose={() => setIsWhiteboardOpen(false)}
                  isMaximized={isWhiteboardMaximized}
                  onToggleMaximize={() => setIsWhiteboardMaximized(true)}
                />
              </div>
              <div className="w-full lg:w-80 h-48 lg:h-full flex-shrink-0">
                <VideoGrid
                  localParticipant={effectiveMyParticipant}
                  localStream={localStream}
                  remoteParticipants={remoteParticipants}
                  remoteStreams={remoteStreams}
                  speakingSocketIds={speakingSocketIds}
                />
              </div>
            </div>
          ) : (
            /* Standard Full Video Grid */
            <VideoGrid
              localParticipant={effectiveMyParticipant}
              localStream={localStream}
              remoteParticipants={remoteParticipants}
              remoteStreams={remoteStreams}
              speakingSocketIds={speakingSocketIds}
            />
          )}
        </main>

        {/* Right Side Panel: Chat */}
        {isChatOpen && (
          <aside className="w-full sm:w-80 md:w-96 h-full flex-shrink-0 z-30 animate-fade-in">
            <ChatPanel
              socket={socket}
              roomCode={code || ''}
              userId={effectiveMyParticipant.userId}
              messages={chatMessages}
              onClose={() => setIsChatOpen(false)}
              onSendFile={handleSendFile}
            />
          </aside>
        )}

        {/* Right Side Panel: Participants */}
        {isParticipantsOpen && (
          <aside className="w-full sm:w-80 md:w-96 h-full flex-shrink-0 z-30 animate-fade-in">
            <ParticipantsPanel
              participants={[effectiveMyParticipant, ...remoteParticipants]}
              currentUserId={effectiveMyParticipant.userId}
              isHost={effectiveMyParticipant.isHost}
              roomCode={code || ''}
              onClose={() => setIsParticipantsOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Bottom Meeting Controls Bar */}
      <ControlsBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isWhiteboardOpen={isWhiteboardOpen}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        isHandRaised={effectiveMyParticipant.isHandRaised}
        isRecording={isRecording}
        recordingTime={formattedTime}
        unreadCount={unreadChatCount}
        participantCount={remoteParticipants.length + 1}
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleWhiteboard={() => setIsWhiteboardOpen((prev) => !prev)}
        onToggleChat={() => {
          setIsChatOpen((prev) => !prev);
          if (!isChatOpen) setUnreadChatCount(0);
        }}
        onToggleParticipants={() => setIsParticipantsOpen((prev) => !prev)}
        onToggleHand={handleToggleHand}
        onToggleRecording={() => {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
        onSendReaction={handleSendReaction}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveMeeting={handleLeaveMeeting}
      />

      {/* Hardware Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        localStream={localStream}
      />
    </div>
  );
};
