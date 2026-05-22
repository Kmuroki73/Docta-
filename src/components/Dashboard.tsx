import { Brain, FileText, Zap, Clock, ArrowRight, Layers, Shield, Globe, Printer, Upload, Sparkles } from 'lucide-react';
import type { UploadedFile, ViewMode } from '../types';
import DropZone from './DropZone';
import { formatFileSize, getFileCategory, getCategoryBg, getCategoryColor } from '../lib/fileUtils';

interface DashboardProps {
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
  onSelectFile: (id: string) => void;
  onViewChange: (view: ViewMode) => void;
}

const capabilities = [
  { icon: Brain, title: 'AI Analysis', desc: 'Insights, summaries & auto notes.' },
  { icon: Zap, title: 'Convert', desc: 'PDF ↔ Word ↔ Excel ↔ Images.' },
  { icon: Layers, title: 'Merge & Split', desc: 'Combine or split documents.' },
  { icon: Shield, title: 'Protect', desc: 'Password & watermarks.' },
  { icon: Globe, title: 'Web Research', desc: 'AI finds related resources.' },
  { icon: Printer, title: 'Print & Sign', desc: 'Print layouts & e-signatures.' },
];

const fileIconMap: Record<string, string> = {
  pdf: '📄', document: '📝', spreadsheet: '📊',
  presentation: '📋', image: '🖼️', video: '🎬', audio: '🎵', unknown: '📁',
};

export default function Dashboard({ files, onFiles, onSelectFile, onViewChange }: DashboardProps) {
  const analyzed = files.filter(f => f.analysisStatus === 'complete').length;
  const hasReady = files.some(f => f.status === 'ready' && f.analysisStatus === 'idle');

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none">
      <div className="max-w-xl mx-auto px-4 py-5 space-y-5">

        {/* Hero */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Your documents,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">supercharged</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI insights, conversions, and auto-generated notes.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Docs', value: files.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Analyzed', value: analyzed, icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Converted', value: 0, icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Saved', value: `${Math.floor(files.length * 0.5)}h`, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/3 border border-white/8 rounded-2xl p-2.5 flex flex-col gap-1.5">
                <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 leading-none">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Drop zone */}
        <DropZone onFiles={onFiles} />

        {/* Analyze CTA */}
        {hasReady && (
          <button
            onClick={() => onViewChange('analysis')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">Analyze with AI</p>
              <p className="text-xs text-slate-400 mt-0.5">Get insights, summary & auto notes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </button>
        )}

        {/* Recent files */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-semibold text-white">Recent Files</h2>
              <span className="text-xs text-slate-500">{files.length} total</span>
            </div>
            <div className="space-y-2">
              {files.slice(0, 6).map(file => {
                const category = getFileCategory(file.type, file.name);
                return (
                  <button
                    key={file.id}
                    onClick={() => { onSelectFile(file.id); onViewChange('viewer'); }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left active:scale-[0.98] hover:border-blue-500/30 hover:bg-white/5 ${getCategoryBg(category)}`}
                  >
                    <span className="text-2xl flex-shrink-0">{fileIconMap[category]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-medium ${getCategoryColor(category)}`}>{category.toUpperCase()}</span>
                        <span className="text-[11px] text-slate-500">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {file.status === 'processing' && (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-[10px] text-yellow-400">{Math.round(file.progress)}%</p>
                          <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${file.progress}%` }} />
                          </div>
                        </div>
                      )}
                      {file.analysisStatus === 'complete' && (
                        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-green-400" />
                        </div>
                      )}
                      {file.analysisStatus === 'analyzing' && (
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                        </div>
                      )}
                      {file.status === 'ready' && file.analysisStatus === 'idle' && (
                        <button
                          onClick={e => { e.stopPropagation(); onSelectFile(file.id); onViewChange('analysis'); }}
                          className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          Analyze
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {files.length === 0 && (
          <div className="p-5 rounded-2xl border border-dashed border-white/10 text-center">
            <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm text-slate-400 mb-1">Drop a file above to get started</p>
            <p className="text-xs text-slate-600">PDF, Word, Excel, images, video, audio</p>
          </div>
        )}

        {/* Capabilities */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">What Docta Can Do</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {capabilities.map(cap => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="bg-white/3 border border-white/8 rounded-2xl p-3.5 hover:border-blue-500/20 hover:bg-white/5 transition-all">
                  <Icon className="w-4 h-4 text-blue-400 mb-2" />
                  <h3 className="text-xs font-semibold text-white mb-1">{cap.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
