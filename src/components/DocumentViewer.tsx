import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Printer, ChevronLeft, ChevronRight, Highlighter, MessageSquare, Pen, Eraser, Bookmark, Maximize2 } from 'lucide-react';
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
  { id: 'draw', icon: Pen, label: 'Draw' },
  { id: 'eraser', icon: Eraser, label: 'Erase' },
  { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
];

const highlightColors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185'];

export default function DocumentViewer({ file, onFiles }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [activeTool, setActiveTool] = useState('select');
  const [highlightColor, setHighlightColor] = useState('#fbbf24');
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const totalPages = file?.category === 'pdf' ? 8 : 1;

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Open a Document</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xs">Upload a file to view it here</p>
        <div className="w-full max-w-sm">
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  const category = getFileCategory(file.type, file.name);
  const isMedia = category === 'video' || category === 'audio';
  const isImage = category === 'image';

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Toolbar */}
      {toolbarVisible && (
        <div className="flex-shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-slate-900/60 border-b border-white/5 overflow-x-auto scrollbar-none">
          {/* Annotation tools */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <button key={tool.id} onClick={() => setActiveTool(tool.id)} title={tool.label}
                  className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${activeTool === tool.id ? 'bg-blue-600/30 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {activeTool === 'highlight' && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/10 flex-shrink-0">
              {highlightColors.map(c => (
                <button key={c} onClick={() => setHighlightColor(c)}
                  className={`w-4 h-4 rounded-full flex-shrink-0 transition-transform ${highlightColor === c ? 'scale-125 ring-2 ring-white/40' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
            <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-400 w-9 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-white/10 mx-0.5" />
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"><RotateCw className="w-3.5 h-3.5" /></button>
            <button onClick={() => setToolbarVisible(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"><Maximize2 className="w-3.5 h-3.5" /></button>
            <button className="hidden sm:block p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"><Printer className="w-3.5 h-3.5" /></button>
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"><Download className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      {!toolbarVisible && (
        <div className="flex-shrink-0 flex justify-end px-3 py-1 bg-slate-900/60 border-b border-white/5">
          <button onClick={() => setToolbarVisible(true)} className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded">Show toolbar</button>
        </div>
      )}

      {/* Document area */}
      <div className="flex-1 overflow-auto bg-slate-950/50 flex items-start justify-center p-3 sm:p-6">
        <div
          className="relative transition-transform duration-200 shadow-2xl max-w-full"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {isMedia ? (
            <div className="w-[min(680px,calc(100vw-2rem))] bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-black aspect-video flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">{category === 'video' ? '🎬' : '🎵'}</span>
                  </div>
                  <p className="text-white font-medium text-sm truncate max-w-[240px] mx-auto">{file.name}</p>
                  <p className="text-slate-400 text-xs mt-1">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <button className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors flex-shrink-0">
                    <span className="text-white text-sm ml-0.5">▶</span>
                  </button>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">0:00 / --:--</span>
                </div>
              </div>
            </div>
          ) : isImage ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="w-[min(720px,calc(100vw-2rem))] aspect-[4/3] bg-slate-200 flex items-center justify-center">
                <div className="text-center text-slate-500 p-4">
                  <span className="text-6xl block mb-2">🖼️</span>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs mt-0.5">{formatFileSize(file.size)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[min(794px,calc(100vw-2rem))] min-h-[900px] bg-white rounded shadow-xl p-8 sm:p-14 relative">
              <div className="border-b border-slate-200 pb-6 mb-6">
                <div className="h-7 bg-slate-800 rounded w-3/4 mb-2.5" />
                <div className="h-3.5 bg-slate-300 rounded w-1/2 mb-1.5" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
              <div className="space-y-2.5">
                {[100,80,90,75,95,60,85,70,88,92,65,78].map((w, i) => (
                  <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-7 mb-5">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
                <div className="space-y-2">
                  {[75,85,65,90,80,72].map((w, i) => (
                    <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <div className="mt-5 p-4 bg-slate-50 border-l-4 border-blue-400 rounded-r">
                <div className="h-3 bg-slate-300 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
              <div className="mt-7 space-y-2">
                {[90,70,95,55,80,65,88].map((w, i) => (
                  <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center text-slate-400 text-xs">
                — {page} of {totalPages} —
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page nav */}
      {!isMedia && !isImage && (
        <div className="flex-shrink-0 flex items-center justify-center gap-3 py-2.5 bg-slate-900/60 border-t border-white/5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-lg transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Page</span>
            <input type="number" value={page}
              onChange={e => setPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-10 bg-white/5 border border-white/10 rounded text-center text-xs text-white py-1 focus:outline-none focus:border-blue-500/50"
            />
            <span className="text-xs text-slate-400">of {totalPages}</span>
          </div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-lg transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
