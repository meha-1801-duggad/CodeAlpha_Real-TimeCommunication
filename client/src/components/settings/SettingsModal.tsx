import React, { useState, useEffect } from 'react';
import { X, Mic, Video, Volume2, Keyboard, Shield } from 'lucide-react';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { sound } from '../../services/soundService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  localStream: MediaStream | null;
  onSelectAudioDevice?: (deviceId: string) => void;
  onSelectVideoDevice?: (deviceId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  localStream,
  onSelectAudioDevice,
  onSelectVideoDevice,
}) => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedCam, setSelectedCam] = useState<string>('');

  const { audioLevel } = useAudioAnalyzer(localStream, false);

  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
        setVideoDevices(devices.filter((d) => d.kind === 'videoinput'));
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    getDevices();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg glass-panel border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-obsidian-900/60">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Audio & Video Settings</h3>
            <p className="text-xs text-obsidian-400">Configure hardware inputs and test audio stream</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-obsidian-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Microphone Selector */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-obsidian-300 mb-2">
              <Mic className="w-4 h-4 text-brand-400" />
              <span>Microphone</span>
            </label>
            <select
              value={selectedMic}
              onChange={(e) => {
                setSelectedMic(e.target.value);
                if (onSelectAudioDevice) onSelectAudioDevice(e.target.value);
              }}
              className="w-full bg-obsidian-850 border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-obsidian-900 text-white">
                    {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="" className="bg-obsidian-900 text-white">Default System Microphone</option>
              )}
            </select>

            {/* Live Mic Meter */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-obsidian-400 font-medium">Input Signal:</span>
              <div className="flex-1 h-2 bg-obsidian-800 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-brand-400 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera Selector */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-obsidian-300 mb-2">
              <Video className="w-4 h-4 text-brand-400" />
              <span>Camera</span>
            </label>
            <select
              value={selectedCam}
              onChange={(e) => {
                setSelectedCam(e.target.value);
                if (onSelectVideoDevice) onSelectVideoDevice(e.target.value);
              }}
              className="w-full bg-obsidian-850 border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-obsidian-900 text-white">
                    {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="" className="bg-obsidian-900 text-white">Default System Camera</option>
              )}
            </select>
          </div>

          {/* Audio Output Test */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-obsidian-300 mb-2">
              <Volume2 className="w-4 h-4 text-brand-400" />
              <span>Speaker Test</span>
            </label>
            <button
              onClick={() => sound.playJoinSound()}
              className="px-4 py-2.5 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] text-xs font-semibold text-obsidian-200 hover:text-white transition-colors"
            >
              Play Harmonic Test Chime
            </button>
          </div>

          {/* Hotkeys Cheat Sheet */}
          <div className="pt-4 border-t border-white/[0.06]">
            <h4 className="flex items-center gap-2 text-xs font-bold text-obsidian-400 uppercase tracking-wider mb-3">
              <Keyboard className="w-4 h-4 text-obsidian-400" />
              <span>Keyboard Shortcuts</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-obsidian-300">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850/60 border border-white/[0.04]">
                <span>Toggle Mic</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-obsidian-750 font-mono text-[11px] text-obsidian-200 border border-white/[0.06]">M</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850/60 border border-white/[0.04]">
                <span>Toggle Camera</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-obsidian-750 font-mono text-[11px] text-obsidian-200 border border-white/[0.06]">V</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850/60 border border-white/[0.04]">
                <span>Share Screen</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-obsidian-750 font-mono text-[11px] text-obsidian-200 border border-white/[0.06]">D</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850/60 border border-white/[0.04]">
                <span>Raise Hand</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-obsidian-750 font-mono text-[11px] text-obsidian-200 border border-white/[0.06]">H</kbd>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-obsidian-300">
              <p className="font-bold text-white mb-0.5">End-to-End Encryption (DTLS-SRTP)</p>
              <p className="text-obsidian-400 leading-relaxed">
                All media audio/video and WebRTC DataChannels are cryptographically encrypted peer-to-peer using DTLS and SRTP.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-obsidian-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
