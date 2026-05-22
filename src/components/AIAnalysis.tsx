import { useState } from 'react';
import {
  Brain, Lightbulb, BookOpen, Star, EyeOff, CheckSquare, Globe,
  Tag, Clock, BarChart2, RefreshCw, Copy, Share2, ChevronRight,
  ExternalLink, Sparkles, TrendingUp, AlertTriangle,
  Video, Music, Image as ImageIcon
} from 'lucide-react';
import type { UploadedFile, AnalysisResult, AnalysisTab } from '../types';
import DropZone from './DropZone';

interface AIAnalysisProps {
  file: UploadedFile | null;
  analysis: AnalysisResult | null;
  onAnalyze: () => void;
  onFiles: (files: File[]) => void;
}

const tabs: { id: AnalysisTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'summary', label: 'Summary', icon: BookOpen },
  { id: 'notes', label: 'Best/Skip', icon: Star },
  { id: 'resources', label: 'Research', icon: Globe },
  { id: 'topics', label: 'Topics', icon: Tag },
];

const sentimentConfig = {
  positive: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Positive' },
  negative: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Negative' },
  neutral: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Neutral' },
};

const relevanceColor = {
  high: 'text-green-400 bg-green-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-slate-400 bg-slate-500/10',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
    >
      {copied ? <span className="text-xs text-green-400">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function AIAnalysis({ file, analysis, onAnalyze, onFiles }: AIAnalysisProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('insights');

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">AI Analysis</h2>
            <p className="text-slate-400 text-sm">Upload a document to get AI-powered insights, summaries, and research links.</p>
          </div>
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
            <Brain className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analyze "{file.name}"</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Get AI-powered insights, key takeaways, best sections, what to skip, research links, and more.
          </p>

          {file.analysisStatus === 'analyzing' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Analyzing document...</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-slate-500">Extracting insights and generating research recommendations</p>
            </div>
          ) : (
            <button
              onClick={onAnalyze}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </button>
          )}
        </div>
      </div>
    );
  }

  const sentiment = sentimentConfig[analysis.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
  const isMedia = file.type.startsWith('video/') || file.type.startsWith('audio/');
  const isImage = file.type.startsWith('image/');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* File header */}
      <div className="px-5 py-4 border-b border-white/5 bg-slate-900/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white truncate">{file.name}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${sentiment.bg} ${sentiment.color}`}>
                <TrendingUp className="w-3 h-3" />
                {sentiment.label}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {analysis.reading_time_minutes} min read
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <BarChart2 className="w-3 h-3" />
                Complexity: {analysis.complexity_score}/100
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">

        {/* Media transcript banner */}
        {(isMedia || isImage) && (activeTab === 'insights' || activeTab === 'summary') && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex items-start gap-2">
            {file.type.startsWith('video/') ? <Video className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> :
             file.type.startsWith('audio/') ? <Music className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> :
             <ImageIcon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />}
            <div>
              <p className="text-xs font-semibold text-cyan-300 mb-0.5">
                {isImage ? 'Visual Analysis' : 'Media Transcript Available'}
              </p>
              <p className="text-xs text-cyan-400/70 leading-relaxed">
                {isImage ? analysis.image_description : analysis.media_transcript?.split('\n').slice(0, 3).join(' ')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Insights</h3>
              <CopyButton text={analysis.key_insights.join('\n')} />
            </div>
            {analysis.key_insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white/3 border border-white/8 rounded-xl hover:border-blue-500/20 transition-colors group">
                <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">{insight}</p>
                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Action Items</h3>
              {analysis.action_items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
                  <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'summary' && (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Summary</h3>
              <CopyButton text={analysis.summary} />
            </div>
            <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>

            {(analysis.media_transcript || analysis.image_description) && (
              <div className="mt-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {analysis.media_transcript ? 'Transcript' : 'Visual Description'}
                </h3>
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
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
                <Star className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Best Parts to Read</h3>
              </div>
              {analysis.best_parts.map((part, i) => (
                <div key={i} className="flex items-start gap-2 p-3 mb-2 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                  <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{part}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Safe to Skip</h3>
              </div>
              {analysis.ignorable_parts.map((part, i) => (
                <div key={i} className="flex items-start gap-2 p-3 mb-2 bg-slate-500/5 border border-slate-500/10 rounded-xl opacity-75">
                  <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-400">{part}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'resources' && (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Research</h3>
              <span className="text-xs text-blue-400">{analysis.web_resources.length} links</span>
            </div>
            {analysis.web_resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-white/3 border border-white/8 rounded-xl hover:border-blue-500/25 hover:bg-white/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{res.title}</p>
                    <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>
                  <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${relevanceColor[res.relevance]}`}>
                    {res.relevance} relevance
                  </span>
                </div>
              </a>
            ))}
          </>
        )}

        {activeTab === 'topics' && (
          <>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detected Topics</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {analysis.topics.map((topic, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm rounded-full font-medium">
                  {topic}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Sentiment</p>
                <p className={`text-sm font-semibold capitalize ${sentiment.color}`}>{analysis.sentiment}</p>
              </div>
              <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Reading Time</p>
                <p className="text-sm font-semibold text-white">{analysis.reading_time_minutes} minutes</p>
              </div>
              <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Complexity</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${analysis.complexity_score}%` }} />
                  </div>
                  <span className="text-xs text-slate-300">{analysis.complexity_score}</span>
                </div>
              </div>
              <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Language</p>
                <p className="text-sm font-semibold text-white uppercase">{analysis.language}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
