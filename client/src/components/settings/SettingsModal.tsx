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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-pearl-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-pearl-100 bg-white">
          <div>
            <h3 className="text-lg font-extrabold text-pearl-900 tracking-tight">Audio & Video Settings</h3>
            <p className="text-xs text-pearl-500 font-medium">Configure hardware inputs and test audio stream</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-pearl-400 hover:text-pearl-700 hover:bg-pearl-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Microphone Selector */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
              <Mic className="w-4 h-4 text-brand-600" />
              <span>Microphone</span>
            </label>
            <select
              value={selectedMic}
              onChange={(e) => {
                setSelectedMic(e.target.value);
                if (onSelectAudioDevice) onSelectAudioDevice(e.target.value);
              }}
              className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl px-4 py-3 text-sm text-pearl-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-colors"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-white text-pearl-900">
                    {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="" className="bg-white text-pearl-900">Default System Microphone</option>
              )}
            </select>

            {/* Live Mic Meter */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-pearl-500 font-semibold">Input Level:</span>
              <div className="flex-1 h-2 bg-pearl-100 rounded-full overflow-hidden border border-pearl-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera Selector */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
              <Video className="w-4 h-4 text-brand-600" />
              <span>Camera</span>
            </label>
            <select
              value={selectedCam}
              onChange={(e) => {
                setSelectedCam(e.target.value);
                if (onSelectVideoDevice) onSelectVideoDevice(e.target.value);
              }}
              className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl px-4 py-3 text-sm text-pearl-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-colors"
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-white text-pearl-900">
                    {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="" className="bg-white text-pearl-900">Default System Camera</option>
              )}
            </select>
          </div>

          {/* Audio Output Test */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
              <Volume2 className="w-4 h-4 text-brand-600" />
              <span>Speaker Test</span>
            </label>
            <button
              onClick={() => sound.playJoinSound()}
              className="px-4 py-2.5 rounded-2xl bg-pearl-100 hover:bg-pearl-200 border border-pearl-200 text-xs font-bold text-pearl-800 transition-colors"
            >
              Play Harmonic Test Chime
            </button>
          </div>

          {/* Hotkeys Cheat Sheet */}
          <div className="pt-4 border-t border-pearl-100">
            <h4 className="flex items-center gap-2 text-xs font-bold text-pearl-600 uppercase tracking-wider mb-3">
              <Keyboard className="w-4 h-4 text-pearl-500" />
              <span>Keyboard Shortcuts</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-pearl-700">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-pearl-50 border border-pearl-200">
                <span className="font-medium">Toggle Mic</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white font-mono text-[11px] font-bold text-pearl-800 border border-pearl-200 shadow-2xs">M</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-pearl-50 border border-pearl-200">
                <span className="font-medium">Toggle Camera</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white font-mono text-[11px] font-bold text-pearl-800 border border-pearl-200 shadow-2xs">V</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-pearl-50 border border-pearl-200">
                <span className="font-medium">Share Screen</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white font-mono text-[11px] font-bold text-pearl-800 border border-pearl-200 shadow-2xs">D</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-pearl-50 border border-pearl-200">
                <span className="font-medium">Raise Hand</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white font-mono text-[11px] font-bold text-pearl-800 border border-pearl-200 shadow-2xs">H</kbd>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-pearl-700">
              <p className="font-bold text-pearl-900 mb-0.5">End-to-End Encryption (DTLS-SRTP)</p>
              <p className="text-pearl-600 leading-relaxed font-normal">
                All media audio/video and WebRTC DataChannels are cryptographically encrypted peer-to-peer using standard DTLS and SRTP protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pearl-100 bg-pearl-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
