import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Download, FileText, Image, Smile } from 'lucide-react';
import { ChatMessage } from '../../types';
import { Socket } from 'socket.io-client';

interface ChatPanelProps {
  socket: Socket | null;
  roomCode: string;
  userId: string;
  messages: ChatMessage[];
  onClose: () => void;
  onSendFile: (file: File) => void;
}

const QUICK_EMOJIS = ['👍', '👏', '❤️', '🎉', '😂', '🔥', '🚀', '💡'];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  socket,
  roomCode,
  userId,
  messages,
  onClose,
  onSendFile,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !socket) return;

    socket.emit('chat-message', {
      roomCode,
      text: inputText.trim(),
    });

    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      e.target.value = ''; // Reset input
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 border-l border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div>
          <h3 className="font-semibold text-white text-base">In-Call Messages</h3>
          <p className="text-xs text-slate-400">Encrypted real-time channel</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
              💬
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Send a note, share a file, or drop a quick emoji to all meeting participants.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.senderId === userId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 px-1">
                  {!isMe && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: msg.senderAvatar || '#6366f1' }}
                    >
                      {msg.senderName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-300">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-tr-xs'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  {msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}

                  {/* File Attachment Card */}
                  {msg.file && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      {msg.file.type.startsWith('image/') && msg.file.dataUrl ? (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                          <img
                            src={msg.file.dataUrl}
                            alt={msg.file.name}
                            className="max-h-48 w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {msg.file.type.startsWith('image/') ? (
                            <Image className="w-5 h-5 flex-shrink-0 text-amber-400" />
                          ) : (
                            <FileText className="w-5 h-5 flex-shrink-0 text-blue-400" />
                          )}
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium truncate">{msg.file.name}</p>
                            <p className="text-[10px] text-slate-400">{formatFileSize(msg.file.size)}</p>
                          </div>
                        </div>

                        {msg.file.dataUrl && (
                          <a
                            href={msg.file.dataUrl}
                            download={msg.file.name}
                            className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Bar */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-slate-800/90 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1 rounded-md hover:bg-slate-700"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/90">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-1.5 border border-slate-700/60 focus-within:border-brand-500 transition-colors">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Attach file (Direct P2P Transfer)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Quick emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 rounded-lg bg-brand-600 text-white disabled:opacity-40 disabled:hover:bg-brand-600 hover:bg-brand-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
