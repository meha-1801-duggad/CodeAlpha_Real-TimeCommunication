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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Audio & Video Settings</h3>
            <p className="text-xs text-slate-400">Configure your hardware inputs and test audio</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Microphone Selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <Mic className="w-4 h-4 text-brand-400" />
              <span>Microphone</span>
            </label>
            <select
              value={selectedMic}
              onChange={(e) => {
                setSelectedMic(e.target.value);
                if (onSelectAudioDevice) onSelectAudioDevice(e.target.value);
              }}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="">Default Microphone</option>
              )}
            </select>

            {/* Live Mic Meter */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Input Level:</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera Selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <Video className="w-4 h-4 text-brand-400" />
              <span>Camera</span>
            </label>
            <select
              value={selectedCam}
              onChange={(e) => {
                setSelectedCam(e.target.value);
                if (onSelectVideoDevice) onSelectVideoDevice(e.target.value);
              }}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="">Default Camera</option>
              )}
            </select>
          </div>

          {/* Audio Output Test */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
              <Volume2 className="w-4 h-4 text-brand-400" />
              <span>Speaker Test</span>
            </label>
            <button
              onClick={() => sound.playJoinSound()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Play Test Chime
            </button>
          </div>

          {/* Hotkeys Cheat Sheet */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <span>Keyboard Shortcuts</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                <span>Toggle Mic</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-slate-200">M</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                <span>Toggle Camera</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-slate-200">V</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                <span>Share Screen</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-slate-200">D</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                <span>Raise Hand</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 font-mono text-[11px] text-slate-200">H</kbd>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <p className="font-semibold text-white mb-0.5">End-to-End Encryption (DTLS-SRTP)</p>
              <p className="text-slate-400 leading-relaxed">
                All media and peer-to-peer data channels are encrypted directly between participating browsers using industry-standard DTLS and SRTP protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
