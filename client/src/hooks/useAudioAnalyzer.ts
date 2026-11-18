import { useEffect, useRef, useState } from 'react';

export const useAudioAnalyzer = (
  stream: MediaStream | null,
  isMuted: boolean,
  onSpeakingChange?: (isSpeaking: boolean) => void
) => {
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 to 100
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speakingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!stream || isMuted || stream.getAudioTracks().length === 0) {
      setAudioLevel(0);
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack || !audioTrack.enabled) {
      setAudioLevel(0);
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setAudioLevel(normalized);

        // Speaking threshold
        const speakingNow = normalized > 15;
        if (speakingNow) {
          if (!isSpeaking) {
            setIsSpeaking(true);
            if (onSpeakingChange) onSpeakingChange(true);
          }
          if (speakingTimeoutRef.current) {
            clearTimeout(speakingTimeoutRef.current);
          }
          speakingTimeoutRef.current = setTimeout(() => {
            setIsSpeaking(false);
            if (onSpeakingChange) onSpeakingChange(false);
          }, 600);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.error('Audio analyzer setup error:', err);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stream, isMuted]);

  return { audioLevel, isSpeaking };
};
