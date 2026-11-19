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
  onSendMessage?: (text: string) => void;
}

const QUICK_EMOJIS = ['👍', '👏', '❤️', '🎉', '😂', '🔥', '🚀', '💡'];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  socket,
  roomCode,
  userId,
  messages,
  onClose,
  onSendFile,
  onSendMessage,
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
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (onSendMessage) {
      onSendMessage(trimmed);
    } else if (socket) {
      socket.emit('chat-message', {
        roomCode,
        text: trimmed,
      });
    }

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
    <div className="flex flex-col h-full w-full bg-white border-l border-pearl-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-pearl-200/90 bg-white/90 backdrop-blur-xl">
        <div>
          <h3 className="font-extrabold text-pearl-900 text-sm tracking-wide">In-Call Messages</h3>
          <p className="text-[11px] text-pearl-500 font-medium">Encrypted real-time channel</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-pearl-400 hover:text-pearl-800 hover:bg-pearl-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pearl-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-pearl-400 py-12">
            <div className="w-12 h-12 rounded-2xl bg-white border border-pearl-200 flex items-center justify-center mb-3 text-xl shadow-xs">
              💬
            </div>
            <p className="text-sm font-bold text-pearl-800">No messages yet</p>
            <p className="text-xs text-pearl-500 max-w-xs mt-1">
              Send a note, attach a file, or drop a quick emoji to all meeting attendees.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] font-semibold text-pearl-600 bg-white px-3 py-1 rounded-full border border-pearl-200 shadow-2xs">
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
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-xs"
                      style={{ backgroundColor: msg.senderAvatar || '#2563EB' }}
                    >
                      {msg.senderName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-pearl-700">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[10px] text-pearl-400 font-mono">{formatTime(msg.timestamp)}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-brand-500/15'
                      : 'bg-white text-pearl-900 border border-pearl-200 rounded-tl-none'
                  }`}
                >
                  {msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}

                  {/* File Attachment Card */}
                  {msg.file && (
                    <div className="mt-2.5 pt-2 border-t border-black/10">
                      {msg.file.type.startsWith('image/') && msg.file.dataUrl ? (
                        <div className="mb-2 rounded-xl overflow-hidden border border-pearl-200 shadow-xs">
                          <img
                            src={msg.file.dataUrl}
                            alt={msg.file.name}
                            className="max-h-48 w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className={`flex items-center justify-between gap-3 p-2.5 rounded-xl ${
                        isMe ? 'bg-black/15 text-white' : 'bg-pearl-100 text-pearl-900'
                      }`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          {msg.file.type.startsWith('image/') ? (
                            <Image className="w-5 h-5 flex-shrink-0 text-amber-500" />
                          ) : (
                            <FileText className="w-5 h-5 flex-shrink-0 text-sky-500" />
                          )}
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate">{msg.file.name}</p>
                            <p className={`text-[10px] font-mono ${isMe ? 'text-white/80' : 'text-pearl-500'}`}>
                              {formatFileSize(msg.file.size)}
                            </p>
                          </div>
                        </div>

                        {msg.file.dataUrl && (
                          <a
                            href={msg.file.dataUrl}
                            download={msg.file.name}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-pearl-200 text-pearl-800'
                            }`}
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
        <div className="px-4 py-2 bg-white border-t border-pearl-200 flex items-center gap-2 overflow-x-auto shadow-inner">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1 rounded-lg hover:bg-pearl-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-pearl-200 bg-white">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex items-center gap-2 bg-pearl-50 rounded-2xl px-3.5 py-2 border border-pearl-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-pearl-500 hover:text-pearl-900 p-1 rounded-lg transition-colors"
            title="Attach file (P2P Transfer)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-pearl-500 hover:text-pearl-900 p-1 rounded-lg transition-colors"
            title="Quick emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-sm text-pearl-900 placeholder-pearl-400 focus:outline-none font-medium"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-brand-600 text-white disabled:opacity-30 disabled:hover:bg-brand-600 hover:bg-brand-500 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
