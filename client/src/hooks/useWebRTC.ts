import { useState, useRef, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

interface WebRTCProps {
  socket: Socket | null;
  localStream: MediaStream | null;
  onFileReceived?: (file: { name: string; size: number; type: string; dataUrl: string }) => void;
}

export const useWebRTC = ({ socket, localStream, onFileReceived }: WebRTCProps) => {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Buffer for incoming P2P file chunks
  const fileBuffers = useRef<Map<string, { chunks: ArrayBuffer[]; receivedBytes: number; meta: any }>>(new Map());

  // Setup DataChannel handlers
  const setupDataChannelEvents = useCallback((channel: RTCDataChannel) => {
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      console.log(`DataChannel [${channel.label}] open`);
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'file-start') {
            fileBuffers.current.set(message.fileId, {
              chunks: [],
              receivedBytes: 0,
              meta: message,
            });
          }
        } catch (e) {
          console.error('DataChannel parse error:', e);
        }
      } else if (event.data instanceof ArrayBuffer) {
        // Chunk received - for simplistic demonstration, find active transfer
        fileBuffers.current.forEach((fileData, fileId) => {
          if (fileData.receivedBytes < fileData.meta.size) {
            fileData.chunks.push(event.data);
            fileData.receivedBytes += event.data.byteLength;

            if (fileData.receivedBytes >= fileData.meta.size) {
              const blob = new Blob(fileData.chunks, { type: fileData.meta.mimeType });
              const reader = new FileReader();
              reader.onload = () => {
                if (onFileReceived) {
                  onFileReceived({
                    name: fileData.meta.name,
                    size: fileData.meta.size,
                    type: fileData.meta.mimeType,
                    dataUrl: reader.result as string,
                  });
                }
              };
              reader.readAsDataURL(blob);
              fileBuffers.current.delete(fileId);
            }
          }
        });
      }
    };
  }, [onFileReceived]);

  // Create PeerConnection for a remote peer
  const createPeerConnection = useCallback((remoteSocketId: string): RTCPeerConnection => {
    if (peerConnections.current.has(remoteSocketId)) {
      return peerConnections.current.get(remoteSocketId)!;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnections.current.set(remoteSocketId, pc);

    // Add local stream tracks to PC
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Remote ICE candidate generated
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // Remote track arrived
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.set(remoteSocketId, stream);
          return updated;
        });
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer ${remoteSocketId} connection state:`, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(remoteSocketId);
      }
    };

    // Create DataChannel (initiator side)
    try {
      const dc = pc.createDataChannel('fileTransfer', { ordered: true });
      setupDataChannelEvents(dc);
      dataChannels.current.set(remoteSocketId, dc);
    } catch (e) {
      console.warn('Could not create data channel:', e);
    }

    // Receive DataChannel (receiver side)
    pc.ondatachannel = (event) => {
      const dc = event.channel;
      setupDataChannelEvents(dc);
      dataChannels.current.set(remoteSocketId, dc);
    };

    return pc;
  }, [localStream, socket, setupDataChannelEvents]);

  // Remove a peer connection
  const removePeer = useCallback((remoteSocketId: string) => {
    const pc = peerConnections.current.get(remoteSocketId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(remoteSocketId);
    }
    dataChannels.current.delete(remoteSocketId);
    pendingCandidates.current.delete(remoteSocketId);

    setRemoteStreams((prev) => {
      const updated = new Map(prev);
      updated.delete(remoteSocketId);
      return updated;
    });
  }, []);

  // Update tracks when localStream changes (e.g. mic/cam toggle or device change)
  useEffect(() => {
    if (!localStream) return;

    peerConnections.current.forEach((pc) => {
      const senders = pc.getSenders();

      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch((err) => {
            console.error('Track replacement error:', err);
          });
        } else {
          try {
            pc.addTrack(track, localStream);
          } catch (e) {
            // Already added or renegotiation needed
          }
        }
      });
    });
  }, [localStream]);

  // Handle Socket Signaling Events
  useEffect(() => {
    if (!socket) return;

    // A newcomer joined, create offer to them
    const handleParticipantJoined = async (participant: { socketId: string; name: string }) => {
      const remoteSocketId = participant.socketId;
      console.log('Initiating WebRTC offer to newcomer:', remoteSocketId);

      const pc = createPeerConnection(remoteSocketId);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', {
          to: remoteSocketId,
          signal: offer,
        });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    // Received WebRTC Signal (Offer or Answer)
    const handleSignal = async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit }) => {
      let pc = peerConnections.current.get(from);
      if (!pc) {
        pc = createPeerConnection(from);
      }

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          // Process queued ICE candidates
          const queued = pendingCandidates.current.get(from) || [];
          for (const cand of queued) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
          pendingCandidates.current.delete(from);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('signal', {
            to: from,
            signal: answer,
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          // Process queued ICE candidates
          const queued = pendingCandidates.current.get(from) || [];
          for (const cand of queued) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
          pendingCandidates.current.delete(from);
        }
      } catch (err) {
        console.error('Error handling WebRTC signal:', err);
      }
    };

    // Received ICE Candidate
    const handleIceCandidate = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(from);
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      } else {
        // Queue until remote description is set
        const list = pendingCandidates.current.get(from) || [];
        list.push(candidate);
        pendingCandidates.current.set(from, list);
      }
    };

    // Participant left
    const handleParticipantLeft = ({ socketId }: { socketId: string }) => {
      removePeer(socketId);
    };

    socket.on('participant-joined', handleParticipantJoined);
    socket.on('signal', handleSignal);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('participant-left', handleParticipantLeft);

    return () => {
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('signal', handleSignal);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('participant-left', handleParticipantLeft);
    };
  }, [socket, createPeerConnection, removePeer]);

  // Seamless track replacer for Screen Share
  const switchVideoTrack = useCallback(async (newTrack: MediaStreamTrack | null) => {
    peerConnections.current.forEach((pc) => {
      const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (videoSender && newTrack) {
        videoSender.replaceTrack(newTrack).catch((err) => {
          console.error('Failed to replace video track with screen share:', err);
        });
      }
    });
  }, []);

  // Send file to peers over DataChannels
  const sendFileP2P = useCallback((file: File, fileId: string) => {
    const CHUNK_SIZE = 16384; // 16 KB chunks

    // Notify peers of incoming file
    const meta = {
      type: 'file-start',
      fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };

    const metaStr = JSON.stringify(meta);

    dataChannels.current.forEach((dc) => {
      if (dc.readyState === 'open') {
        dc.send(metaStr);
      }
    });

    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onload = (e) => {
      if (!e.target?.result) return;
      const buffer = e.target.result as ArrayBuffer;

      dataChannels.current.forEach((dc) => {
        if (dc.readyState === 'open') {
          dc.send(buffer);
        }
      });

      offset += buffer.byteLength;

      if (offset < file.size) {
        readNextSlice();
      }
    };

    const readNextSlice = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      fileReader.readAsArrayBuffer(slice);
    };

    readNextSlice();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      dataChannels.current.clear();
      pendingCandidates.current.clear();
      fileBuffers.current.clear();
    };
  }, []);

  return {
    remoteStreams,
    switchVideoTrack,
    sendFileP2P,
  };
};
