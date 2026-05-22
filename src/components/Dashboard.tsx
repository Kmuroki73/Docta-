import { Brain, FileText, Zap, Clock, ArrowRight, Layers, Shield, Globe, Printer, Upload } from 'lucide-react';
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
  { icon: Brain, title: 'AI Analysis', desc: 'Insights, summaries, topics & auto notes.' },
  { icon: Zap, title: 'Convert', desc: 'PDF ↔ Word ↔ Excel ↔ Images and more.' },
  { icon: Layers, title: 'Merge & Split', desc: 'Combine or split documents precisely.' },
  { icon: Shield, title: 'Protect', desc: 'Password, encryption & watermarks.' },
  { icon: Globe, title: 'Web Research', desc: 'AI suggests related resources & papers.' },
  { icon: Printer, title: 'Print & Sign', desc: 'Professional print layouts & e-signatures.' },
];

const fileIconMap: Record<string, string> = {
  pdf: '📄', document: '📝', spreadsheet: '📊',
  presentation: '📋', image: '🖼️', video: '🎬', audio: '🎵', unknown: '📁',
};

export default function Dashboard({ files, onFiles, onSelectFile, onViewChange }: DashboardProps) {
  const analyzed = files.filter(f => f.analysisStatus === 'complete').length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Your documents,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">supercharged</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Upload any file and get instant AI insights, conversions, and auto-generated notes.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Documents', value: files.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Analyzed', value: analyzed, icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Converted', value: 0, icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Time Saved', value: `${Math.floor(files.length * 0.5)}h`, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/3 border border-white/8 rounded-xl p-3">
                <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Drop zone */}
        <div className="mb-6">
          <DropZone onFiles={onFiles} />
        </div>

        {/* Recent files */}
        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Recent Files</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {files.slice(0, 5).map(file => {
                const category = getFileCategory(file.type, file.name);
                return (
                  <button
                    key={file.id}
                    onClick={() => { onSelectFile(file.id); onViewChange('viewer'); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:border-blue-500/30 hover:bg-white/5 ${getCategoryBg(category)}`}
                  >
                    <span className="text-xl flex-shrink-0">{fileIconMap[category]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-medium ${getCategoryColor(category)}`}>{category.toUpperCase()}</span>
                        <span className="text-[11px] text-slate-500">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {file.status === 'processing' && (
                        <div className="text-right">
                          <p className="text-[10px] text-yellow-400 mb-1">{Math.round(file.progress)}%</p>
                          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${file.progress}%` }} />
                          </div>
                        </div>
                      )}
                      {file.analysisStatus === 'complete' && (
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Brain className="w-3 h-3 text-green-400" />
                        </div>
                      )}
                      {file.analysisStatus === 'analyzing' && (
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state CTA */}
        {files.length === 0 && (
          <div className="mb-6 p-5 rounded-xl border border-blue-500/15 bg-blue-500/5 text-center">
            <Upload className="w-8 h-8 text-blue-500/40 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Drop a file above to get started</p>
            <p className="text-xs text-slate-600">Supports PDF, Word, Excel, images, video, audio</p>
          </div>
        )}

        {/* Capabilities */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">What Docta Can Do</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {capabilities.map(cap => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="bg-white/3 border border-white/8 rounded-xl p-3.5 hover:border-blue-500/20 hover:bg-white/5 transition-all">
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
