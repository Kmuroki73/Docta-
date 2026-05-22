import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Printer, ChevronLeft, ChevronRight, Highlighter, MessageSquare, Pen, Eraser, Bookmark, Fullscreen as FullscreenIcon, Share2 } from 'lucide-react';
import type { UploadedFile } from '../types';
import { getFileCategory, formatFileSize } from '../lib/fileUtils';
import DropZone from './DropZone';

interface DocumentViewerProps {
  file: UploadedFile | null;
  onFiles: (files: File[]) => void;
}

const tools = [
  { id: 'select', icon: Pen, label: 'Select' },
  { id: 'highlight', icon: Highlighter, label: 'Highlight' },
  { id: 'comment', icon: MessageSquare, label: 'Comment' },
  { id: 'pen', icon: Pen, label: 'Draw' },
  { id: 'eraser', icon: Eraser, label: 'Erase' },
  { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
];

const highlightColors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185'];

export default function DocumentViewer({ file, onFiles }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [activeTool, setActiveTool] = useState('select');
  const [highlightColor, setHighlightColor] = useState('#fbbf24');
  const totalPages = file?.category === 'pdf' ? 8 : 1;

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Open a Document</h2>
            <p className="text-slate-400 text-sm">Upload a file to view and edit it here</p>
          </div>
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  const category = getFileCategory(file.type, file.name);
  const isMedia = category === 'video' || category === 'audio';
  const isImage = category === 'image';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Viewer toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border-b border-white/5">
        <div className="flex items-center gap-1 mr-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`p-1.5 rounded-lg transition-all ${
                  activeTool === tool.id
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {activeTool === 'highlight' && (
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            {highlightColors.map(color => (
              <button
                key={color}
                onClick={() => setHighlightColor(color)}
                className={`w-4 h-4 rounded-full transition-transform ${highlightColor === color ? 'scale-125 ring-2 ring-white/30' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(200, z + 25))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <FullscreenIcon className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main view area */}
      <div className="flex-1 overflow-auto bg-slate-950/50 flex items-center justify-center p-6">
        <div
          className="relative transition-transform duration-200 shadow-2xl"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {isMedia ? (
            <div className="w-[720px] bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-black aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-4xl">{category === 'video' ? '🎬' : '🎵'}</span>
                  </div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-sm mt-1">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors">
                    <span className="text-white text-lg ml-0.5">▶</span>
                  </button>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-400">0:00 / --:--</span>
                </div>
              </div>
            </div>
          ) : isImage ? (
            <div className="bg-white rounded-lg overflow-hidden max-w-[800px]">
              <div className="w-[800px] h-[600px] bg-slate-200 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <span className="text-8xl block mb-2">🖼️</span>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm">{formatFileSize(file.size)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[794px] min-h-[1123px] bg-white rounded-sm shadow-xl p-16 relative">
              {/* Mock document content */}
              <div className="border-b border-slate-200 pb-8 mb-8">
                <div className="h-8 bg-slate-800 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-300 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
              <div className="space-y-3">
                {[100, 80, 90, 75, 95, 60, 85, 70, 88].map((w, i) => (
                  <div key={i} className={`h-3 bg-slate-200 rounded`} style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-8 mb-6">
                <div className="h-5 bg-slate-700 rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  {[75, 85, 65, 90, 80].map((w, i) => (
                    <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-50 border-l-4 border-blue-400 rounded-r">
                <div className="h-3 bg-slate-300 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
              <div className="mt-8 space-y-2">
                {[90, 70, 95, 55, 80, 65].map((w, i) => (
                  <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute bottom-8 left-0 right-0 text-center text-slate-400 text-xs">
                — {page} of {totalPages} —
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page navigation */}
      {!isMedia && !isImage && (
        <div className="flex items-center justify-center gap-4 py-3 bg-slate-900/60 border-t border-white/5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Page</span>
            <input
              type="number"
              value={page}
              onChange={e => setPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-12 bg-white/5 border border-white/10 rounded text-center text-xs text-white py-1 focus:outline-none focus:border-blue-500/50"
            />
            <span className="text-xs text-slate-400">of {totalPages}</span>
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-lg transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
