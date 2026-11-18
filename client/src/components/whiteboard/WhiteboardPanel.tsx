import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Highlighter,
  Minus,
  MoveRight,
  Square,
  Circle,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { WhiteboardElement, WhiteboardTool, WhiteboardCursor } from '../../types';
import { Socket } from 'socket.io-client';

interface WhiteboardPanelProps {
  socket: Socket | null;
  roomCode: string;
  userId: string;
  userName: string;
  userColor: string;
  initialElements?: WhiteboardElement[];
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const COLORS = [
  '#ffffff', // White
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#94a3b8', // Gray
  '#0f172a', // Dark
];

const STROKE_WIDTHS = [2, 4, 8, 14];

export const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({
  socket,
  roomCode,
  userId,
  userName,
  userColor,
  initialElements = [],
  onClose,
  isMaximized,
  onToggleMaximize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<WhiteboardTool>('brush');
  const [color, setColor] = useState<string>('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);

  const [elements, setElements] = useState<WhiteboardElement[]>(initialElements);
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  const [remoteCursors, setRemoteCursors] = useState<Map<string, WhiteboardCursor>>(new Map());

  const isDrawing = useRef(false);
  const currentElement = useRef<WhiteboardElement | null>(null);

  // Redraw full canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid dots background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const spacing = 30;
    for (let x = 0; x < canvas.width; x += spacing) {
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Render elements
    elements.forEach((el) => {
      ctx.save();
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'brush' || el.type === 'highlighter') {
        if (!el.points || el.points.length < 2) {
          ctx.restore();
          return;
        }
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'line' && el.points && el.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
        ctx.stroke();
      } else if (el.type === 'arrow' && el.points && el.points.length >= 2) {
        const start = el.points[0];
        const end = el.points[el.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headlen = el.strokeWidth * 3 + 8;
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (el.type === 'rect' && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        ctx.beginPath();
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.type === 'circle' && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        ctx.beginPath();
        const rx = Math.abs(el.width / 2);
        const ry = Math.abs(el.height / 2);
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.type === 'text' && el.x !== undefined && el.y !== undefined && el.text) {
        ctx.font = `600 ${el.strokeWidth * 4 + 14}px Plus Jakarta Sans, sans-serif`;
        ctx.fillText(el.text, el.x, el.y);
      }

      ctx.restore();
    });
  }, [elements]);

  // Sync canvas size to container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Socket event listeners for real-time collaboration
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (element: WhiteboardElement) => {
      setElements((prev) => [...prev, element]);
    };

    const handleRemoteClear = () => {
      setElements([]);
      setHistory([]);
      setRedoStack([]);
    };

    const handleRemoteCursor = (cursor: WhiteboardCursor) => {
      if (cursor.userId === userId) return;
      setRemoteCursors((prev) => {
        const updated = new Map(prev);
        updated.set(cursor.userId, cursor);
        return updated;
      });
    };

    socket.on('whiteboard-draw', handleRemoteDraw);
    socket.on('whiteboard-clear', handleRemoteClear);
    socket.on('whiteboard-cursor', handleRemoteCursor);

    return () => {
      socket.off('whiteboard-draw', handleRemoteDraw);
      socket.off('whiteboard-clear', handleRemoteClear);
      socket.off('whiteboard-cursor', handleRemoteCursor);
    };
  }, [socket, userId]);

  // Get mouse coordinates relative to canvas
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e);
    isDrawing.current = true;

    // Save history snapshot for Undo
    setHistory((prev) => [...prev, elements]);
    setRedoStack([]);

    if (tool === 'text') {
      const text = prompt('Enter annotation text:');
      if (text && text.trim()) {
        const textElement: WhiteboardElement = {
          id: `${userId}_${Date.now()}`,
          type: 'text',
          x,
          y,
          text: text.trim(),
          color,
          strokeWidth,
          userId,
        };
        setElements((prev) => [...prev, textElement]);
        if (socket) socket.emit('whiteboard-draw', textElement);
      }
      isDrawing.current = false;
      return;
    }

    if (tool === 'eraser') {
      // Find element nearest to click and remove it
      setElements((prev) =>
        prev.filter((el) => {
          if (el.points) {
            return !el.points.some((p) => Math.hypot(p.x - x, p.y - y) < 15);
          }
          if (el.x !== undefined && el.y !== undefined) {
            return !(Math.abs(el.x - x) < 30 && Math.abs(el.y - y) < 30);
          }
          return true;
        })
      );
      isDrawing.current = false;
      return;
    }

    const newElement: WhiteboardElement = {
      id: `${userId}_${Date.now()}`,
      type: tool,
      points: [{ x, y }],
      x,
      y,
      width: 0,
      height: 0,
      color: tool === 'highlighter' ? `${color}66` : color,
      strokeWidth: tool === 'highlighter' ? strokeWidth * 3 : strokeWidth,
      userId,
    };

    currentElement.current = newElement;
    setElements((prev) => [...prev, newElement]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e);

    // Broadcast cursor position
    if (socket) {
      socket.emit('whiteboard-cursor', { roomCode, x, y });
    }

    if (!isDrawing.current || !currentElement.current) return;

    if (tool === 'brush' || tool === 'highlighter') {
      currentElement.current.points = [...(currentElement.current.points || []), { x, y }];
      setElements((prev) =>
        prev.map((el) => (el.id === currentElement.current?.id ? currentElement.current! : el))
      );
    } else if (tool === 'rect' || tool === 'circle' || tool === 'line' || tool === 'arrow') {
      const startX = currentElement.current.x || x;
      const startY = currentElement.current.y || y;
      currentElement.current.width = x - startX;
      currentElement.current.height = y - startY;
      if (currentElement.current.points) {
        currentElement.current.points = [
          currentElement.current.points[0],
          { x, y },
        ];
      }
      setElements((prev) =>
        prev.map((el) => (el.id === currentElement.current?.id ? currentElement.current! : el))
      );
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentElement.current && socket) {
      socket.emit('whiteboard-draw', currentElement.current);
    }
    currentElement.current = null;
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [...prev, elements]);
    setElements(last);
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, elements]);
    setElements(next);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // Clear Canvas
  const handleClear = () => {
    if (elements.length === 0) return;
    if (confirm('Clear the entire collaborative whiteboard?')) {
      setHistory((prev) => [...prev, elements]);
      setElements([]);
      setRedoStack([]);
      if (socket) socket.emit('whiteboard-clear');
    }
  };

  // Export to PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create temporary canvas with solid dark background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    expCtx.fillStyle = '#0f172a';
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    expCtx.drawImage(canvas, 0, 0);

    const a = document.createElement('a');
    a.download = `NexusMeet-Whiteboard-${Date.now()}.png`;
    a.href = exportCanvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[#0d131f] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Floating Whiteboard Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Tools Palette */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'brush' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Brush"
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'highlighter' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'line' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Line"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'arrow' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Arrow"
          >
            <MoveRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'rect' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'circle' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'text' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Add Text"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-slate-700 mx-1" />

          {/* Stroke Widths */}
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  strokeWidth === width ? 'bg-slate-800 border border-brand-500' : 'hover:bg-slate-800/60'
                }`}
                title={`Stroke ${width}px`}
              >
                <div
                  className="rounded-full bg-white"
                  style={{ width: `${Math.min(16, width + 2)}px`, height: `${Math.min(16, width + 2)}px` }}
                />
              </button>
            ))}
          </div>

          <div className="w-[1px] h-6 bg-slate-700 mx-1" />

          {/* Color Palette */}
          <div className="flex items-center gap-1">
            {COLORS.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Action Controls (Undo, Redo, Clear, Save, Maximize, Close) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            title="Export as PNG"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-6 bg-slate-700 mx-1" />
          <button
            onClick={onToggleMaximize}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title={isMaximized ? 'Restore View' : 'Maximize Whiteboard'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Close Whiteboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Canvas Container */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Remote Participant Real-Time Cursors */}
        {Array.from(remoteCursors.values()).map((cursor) => (
          <div
            key={cursor.userId}
            className="pointer-events-none absolute z-10 transition-all duration-75 ease-linear flex items-center gap-1.5"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* SVG Cursor Pointer */}
            <svg
              className="w-5 h-5 drop-shadow-md"
              viewBox="0 0 24 24"
              fill={cursor.color || '#3b82f6'}
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" />
            </svg>
            <span
              className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-full shadow-md whitespace-nowrap"
              style={{ backgroundColor: cursor.color || '#3b82f6' }}
            >
              {cursor.userName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
