import { useState } from 'react';
import {
  Brain, Lightbulb, BookOpen, Star, EyeOff, CheckSquare, Globe,
  Tag, Clock, BarChart2, RefreshCw, Copy, Share2, ChevronRight,
  ExternalLink, Sparkles, TrendingUp, AlertTriangle,
  Video, Music, Image as ImageIcon, StickyNote
} from 'lucide-react';
import type { UploadedFile, AnalysisResult, AnalysisTab } from '../types';
import DropZone from './DropZone';

interface AIAnalysisProps {
  file: UploadedFile | null;
  analysis: AnalysisResult | null;
  onAnalyze: () => void;
  onFiles: (files: File[]) => void;
  onViewNotes?: () => void;
}

const tabs: { id: AnalysisTab; label: string; mobileLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'insights', label: 'Insights', mobileLabel: 'Insights', icon: Lightbulb },
  { id: 'summary', label: 'Summary', mobileLabel: 'Summary', icon: BookOpen },
  { id: 'notes', label: 'Best/Skip', mobileLabel: 'Best', icon: Star },
  { id: 'resources', label: 'Research', mobileLabel: 'Links', icon: Globe },
  { id: 'topics', label: 'Topics', mobileLabel: 'Topics', icon: Tag },
];

const sentimentConfig = {
  positive: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Positive' },
  negative: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Negative' },
  neutral: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Neutral' },
};

const relevanceColor: Record<string, string> = {
  high: 'text-green-400 bg-green-500/10 border border-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
  low: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
    >
      {copied ? <span className="text-[11px] text-green-400 font-medium">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function AIAnalysis({ file, analysis, onAnalyze, onFiles, onViewNotes }: AIAnalysisProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('insights');

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">AI Analysis</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xs">Upload a document to get AI-powered insights, summaries, and auto-generated notes.</p>
        <div className="w-full max-w-sm">
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-4">
          <span className="text-sm">{file.type.startsWith('video/') ? '🎬' : file.type.startsWith('audio/') ? '🎵' : file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
          <span className="text-xs text-slate-300 max-w-[180px] truncate font-medium">{file.name}</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Ready to Analyze</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
          AI will extract key insights, summarize content, and automatically generate notes for you.
        </p>
        {file.analysisStatus === 'analyzing' ? (
          <div className="w-full max-w-xs space-y-3">
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Analyzing document...</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse w-2/3" />
            </div>
            <p className="text-xs text-slate-500">Extracting insights · Generating notes · Finding resources</p>
          </div>
        ) : (
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={onAnalyze}
              disabled={file.status !== 'ready'}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all active:scale-95 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </button>
            {file.status !== 'ready' && (
              <p className="text-xs text-slate-500">Waiting for file to finish processing...</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const sentiment = sentimentConfig[analysis.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
  const isMedia = file.type.startsWith('video/') || file.type.startsWith('audio/');
  const isImage = file.type.startsWith('image/');

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-0 bg-slate-900/40 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base flex-shrink-0">
            {file.type.startsWith('video/') ? '🎬' : file.type.startsWith('audio/') ? '🎵' : file.type.startsWith('image/') ? '🖼️' : '📄'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{file.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${sentiment.bg} ${sentiment.color}`}>
                <TrendingUp className="w-2.5 h-2.5" />{sentiment.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-2.5 h-2.5" />{analysis.reading_time_minutes}m read
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <BarChart2 className="w-2.5 h-2.5" />{analysis.complexity_score}/100
              </span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={onAnalyze} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Re-analyze">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {onViewNotes && (
              <button onClick={onViewNotes} className="hidden sm:flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg transition-colors border border-blue-500/20">
                <StickyNote className="w-3 h-3" />Notes
              </button>
            )}
            <button className="hidden sm:block p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  active ? 'border-blue-400 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 sm:px-4 py-4 space-y-3">

          {/* Media banner */}
          {(isMedia || isImage) && (activeTab === 'insights' || activeTab === 'summary') && (
            <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl p-3 flex items-start gap-2.5">
              {file.type.startsWith('video/') ? <Video className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
               : file.type.startsWith('audio/') ? <Music className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
               : <ImageIcon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-cyan-300 mb-0.5">
                  {isImage ? 'Visual Analysis Active' : 'Transcript Available'}
                </p>
                <p className="text-xs text-cyan-400/70 leading-relaxed line-clamp-2">
                  {isImage ? analysis.image_description : analysis.media_transcript?.split('\n').slice(0, 2).join(' ')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Key Insights</h3>
                <CopyButton text={analysis.key_insights.join('\n')} />
              </div>
              <div className="space-y-2">
                {analysis.key_insights.map((insight, i) => (
                  <div key={i} className="flex gap-2.5 p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-blue-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="w-3.5 h-3.5 text-green-400" />
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Action Items</h3>
                </div>
                <div className="space-y-1">
                  {analysis.action_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-0">
                      <div className="w-4 h-4 rounded border border-green-500/40 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {onViewNotes && (
                <button onClick={onViewNotes} className="w-full flex items-center justify-center gap-2 mt-1 py-2.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 rounded-xl text-blue-400 text-sm font-medium transition-colors">
                  <StickyNote className="w-4 h-4" />
                  View Auto-Generated Notes
                </button>
              )}
            </>
          )}

          {activeTab === 'summary' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Document Summary</h3>
                <CopyButton text={analysis.summary} />
              </div>
              <div className="p-3 sm:p-4 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-sm text-slate-200 leading-relaxed">{analysis.summary}</p>
              </div>
              {(analysis.media_transcript || analysis.image_description) && (
                <div className="pt-1">
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {analysis.media_transcript ? 'Transcript' : 'Visual Description'}
                  </h3>
                  <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {analysis.media_transcript || analysis.image_description}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'notes' && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <h3 className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider">Best Parts to Read</h3>
                </div>
                <div className="space-y-2">
                  {analysis.best_parts.map((part, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                      <ChevronRight className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-snug">{part}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Safe to Skip</h3>
                </div>
                <div className="space-y-2">
                  {analysis.ignorable_parts.map((part, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-500/5 border border-slate-500/10 rounded-xl opacity-70">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-400 leading-snug">{part}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'resources' && (
            <>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Research</h3>
                <span className="text-[11px] text-blue-400">{analysis.web_resources.length} links</span>
              </div>
              <div className="space-y-2">
                {analysis.web_resources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-white/3 border border-white/8 rounded-xl hover:border-blue-500/25 hover:bg-white/5 transition-all group">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1 justify-between">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">{res.title}</p>
                        <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5 ml-1" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>
                      <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${relevanceColor[res.relevance]}`}>
                        {res.relevance} relevance
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}

          {activeTab === 'topics' && (
            <>
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Detected Topics</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {analysis.topics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-[10px] text-slate-500 mb-1">Sentiment</p>
                  <p className={`text-sm font-semibold capitalize ${sentiment.color}`}>{analysis.sentiment}</p>
                </div>
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-[10px] text-slate-500 mb-1">Read Time</p>
                  <p className="text-sm font-semibold text-white">{analysis.reading_time_minutes} min</p>
                </div>
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl col-span-2">
                  <p className="text-[10px] text-slate-500 mb-1.5">Complexity</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${analysis.complexity_score}%` }} />
                    </div>
                    <span className="text-xs text-slate-300">{analysis.complexity_score}/100</span>
                  </div>
                </div>
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-[10px] text-slate-500 mb-1">Language</p>
                  <p className="text-sm font-semibold text-white uppercase">{analysis.language}</p>
                </div>
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-[10px] text-slate-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-white capitalize">{file.category}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
