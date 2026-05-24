import {
  LayoutDashboard, FileText, Brain, Wrench, StickyNote, Video, MessageSquare,
  Upload, Star, Clock, Trash2, ChevronRight, FolderOpen, Plus
} from 'lucide-react';
import type { ViewMode } from '../types';
import type { UploadedFile } from '../types';
import { getFileCategory, formatFileSize } from '../lib/fileUtils';

interface SidebarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  files: UploadedFile[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onUploadClick: () => void;
}

const navItems = [
  { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'viewer' as ViewMode, label: 'Viewer', icon: FileText },
  { id: 'analysis' as ViewMode, label: 'AI Analysis', icon: Brain },
  { id: 'chat' as ViewMode, label: 'AI Chat', icon: MessageSquare },
  { id: 'notes' as ViewMode, label: 'Notes', icon: StickyNote },
  { id: 'tools' as ViewMode, label: 'Tools', icon: Wrench },
  { id: 'media' as ViewMode, label: 'Media & Images', icon: Video },
];

const fileIconMap: Record<string, string> = {
  pdf: '📄',
  document: '📝',
  spreadsheet: '📊',
  presentation: '📋',
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  unknown: '📁',
};

export default function Sidebar({ view, onViewChange, files, selectedFileId, onSelectFile, onUploadClick }: SidebarProps) {
  const recentFiles = files.slice(0, 6);

  return (
    <aside className="w-56 bg-slate-900/50 border-r border-white/5 flex flex-col h-full">
      {/* Upload button */}
      <div className="p-3">
        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 pb-1">Navigation</p>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                active
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Recent files */}
      <div className="flex-1 px-2 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between px-2 pb-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Recent Files</p>
          <FolderOpen className="w-3 h-3 text-slate-600" />
        </div>

        {recentFiles.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <Upload className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-600">No files yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentFiles.map(file => {
              const category = getFileCategory(file.type, file.name);
              const isSelected = selectedFileId === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                    isSelected ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{fileIconMap[category] || '📁'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-300 truncate font-medium">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                  {file.status === 'processing' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                  )}
                  {file.analysisStatus === 'complete' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/5 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Star className="w-4 h-4" />
          Favorites
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Clock className="w-4 h-4" />
          History
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <Trash2 className="w-4 h-4" />
          Trash
        </button>
      </div>
    </aside>
  );
}
