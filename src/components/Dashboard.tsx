import { Brain, FileText, Zap, Clock, ArrowRight, Layers, Shield, Globe, Printer } from 'lucide-react';
import type { UploadedFile } from '../types';
import DropZone from './DropZone';
import { formatFileSize, getFileCategory, getCategoryBg, getCategoryColor } from '../lib/fileUtils';
import type { ViewMode } from '../types';

interface DashboardProps {
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
  onSelectFile: (id: string) => void;
  onViewChange: (view: ViewMode) => void;
}

const stats = [
  { label: 'Documents', value: '0', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Analyses', value: '0', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'Conversions', value: '0', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Time Saved', value: '0h', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

const capabilities = [
  { icon: Brain, title: 'AI Deep Analysis', desc: 'Insights, summaries, key points, topics and research links extracted instantly.' },
  { icon: Zap, title: 'Format Conversion', desc: 'PDF ↔ Word ↔ Excel ↔ Images ↔ HTML and 20+ more formats in seconds.' },
  { icon: Layers, title: 'Merge & Split', desc: 'Combine multiple documents or split large files into precise sections.' },
  { icon: Shield, title: 'Compress & Protect', desc: 'Reduce file sizes up to 90% and add passwords or encryption.' },
  { icon: Globe, title: 'Web Research', desc: 'AI suggests related resources, papers, and links based on document content.' },
  { icon: Printer, title: 'Print & Sign', desc: 'Professional print layouts, e-signatures, and watermarks built in.' },
];

const fileIconMap: Record<string, string> = {
  pdf: '📄', document: '📝', spreadsheet: '📊',
  presentation: '📋', image: '🖼️', video: '🎬', audio: '🎵', unknown: '📁',
};

export default function Dashboard({ files, onFiles, onSelectFile, onViewChange }: DashboardProps) {
  const dynamicStats = [
    { ...stats[0], value: String(files.length) },
    { ...stats[1], value: String(files.filter(f => f.analysisStatus === 'complete').length) },
    { ...stats[2], value: '0' },
    { ...stats[3], value: `${Math.floor(files.length * 0.5)}h` },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/20" />
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest px-3">AI-Powered Document Intelligence</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/20" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your documents,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              supercharged
            </span>
          </h1>
          <p className="text-slate-400 text-base">
            Upload any file — PDF, Word, image, video, audio — and get instant AI insights, conversions, and research.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {dynamicStats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Drop zone */}
        <div className="mb-8">
          <DropZone onFiles={onFiles} />
        </div>

        {/* Recent files */}
        {files.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Recent Files</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.slice(0, 6).map(file => {
                const category = getFileCategory(file.type, file.name);
                return (
                  <button
                    key={file.id}
                    onClick={() => { onSelectFile(file.id); onViewChange('viewer'); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:border-blue-500/30 hover:bg-white/5 ${getCategoryBg(category)}`}
                  >
                    <span className="text-2xl">{fileIconMap[category]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs ${getCategoryColor(category)}`}>{category.toUpperCase()}</span>
                        <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    {file.analysisStatus === 'complete' && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Brain className="w-3 h-3 text-green-400" />
                      </div>
                    )}
                    {file.analysisStatus === 'analyzing' && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Capabilities */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Everything You Need</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {capabilities.map(cap => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:border-blue-500/20 hover:bg-white/5 transition-all">
                  <Icon className="w-5 h-5 text-blue-400 mb-2" />
                  <h3 className="text-sm font-semibold text-white mb-1">{cap.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
