import { useState } from 'react';
import { Video, Music, Image as ImageIcon, Wand2, RefreshCw, ChevronRight } from 'lucide-react';
import type { UploadedFile } from '../types';
import DropZone from './DropZone';
import { getFileCategory } from '../lib/fileUtils';

interface MediaPanelProps {
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
}

const mediaCapabilities = [
  {
    icon: Video,
    title: 'Video Analysis',
    desc: 'Extract transcripts, identify speakers, summarize chapters, detect key moments.',
    formats: ['MP4', 'MOV', 'WEBM', 'AVI'],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Music,
    title: 'Audio & Podcasts',
    desc: 'Transcribe speech, identify speakers, extract quotes and key points.',
    formats: ['MP3', 'WAV', 'M4A', 'OGG'],
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: ImageIcon,
    title: 'Image Intelligence',
    desc: 'Detect objects, read text (OCR), analyze charts, describe scenes in detail.',
    formats: ['JPG', 'PNG', 'WEBP', 'SVG'],
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
];

const imageAnalysisFeatures = [
  'Object & scene detection',
  'Text extraction (OCR)',
  'Chart & graph reading',
  'Face detection (blurred for privacy)',
  'Color palette analysis',
  'Metadata extraction',
  'Quality assessment',
  'Format optimization suggestions',
];

const audioVideoFeatures = [
  'Auto-transcription in 50+ languages',
  'Speaker identification & diarization',
  'Chapter detection & timestamps',
  'Key quotes extraction',
  'Sentiment per speaker',
  'Background noise detection',
  'Export to SRT/VTT subtitles',
  'Generate summary document',
];

export default function MediaPanel({ files, onFiles }: MediaPanelProps) {
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, string>>({});

  const mediaFiles = files.filter(f => {
    const cat = getFileCategory(f.type, f.name);
    return cat === 'video' || cat === 'audio' || cat === 'image';
  });

  function processFile(id: string) {
    setProcessing(p => ({ ...p, [id]: true }));
    setTimeout(() => {
      setProcessing(p => ({ ...p, [id]: false }));
      setResults(r => ({ ...r, [id]: 'Analysis complete — view in AI Analysis tab.' }));
    }, 2500);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Media & Image Intelligence</h2>
          <p className="text-slate-400 text-sm">Upload videos, audio, or images to extract text, transcripts, insights, and more.</p>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {mediaCapabilities.map(cap => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className={`p-5 rounded-xl border ${cap.bg} ${cap.border}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cap.bg} border ${cap.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cap.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1">{cap.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">{cap.desc}</p>
                    <div className="flex gap-1.5">
                      {cap.formats.map(fmt => (
                        <span key={fmt} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded font-mono">{fmt}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload */}
        <div className="mb-8">
          <DropZone onFiles={onFiles} compact />
        </div>

        {/* Uploaded media files */}
        {mediaFiles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-white mb-3">Media Files ({mediaFiles.length})</h3>
            <div className="space-y-3">
              {mediaFiles.map(file => {
                const cat = getFileCategory(file.type, file.name);
                const Icon = cat === 'video' ? Video : cat === 'audio' ? Music : ImageIcon;
                const color = cat === 'video' ? 'text-cyan-400' : cat === 'audio' ? 'text-yellow-400' : 'text-pink-400';
                const isProc = processing[file.id];
                const result = results[file.id];

                return (
                  <div key={file.id} className="p-4 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{file.name}</p>
                        {result && <p className="text-xs text-green-400 mt-0.5">{result}</p>}
                      </div>
                      <button
                        onClick={() => processFile(file.id)}
                        disabled={isProc}
                        className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all disabled:opacity-50"
                      >
                        {isProc ? (
                          <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Wand2 className="w-3.5 h-3.5" /> Analyze</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature grids */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-white">Image Features</h3>
            </div>
            <div className="space-y-1.5">
              {imageAnalysisFeatures.map(feat => (
                <div key={feat} className="flex items-center gap-2 text-xs text-slate-400">
                  <ChevronRight className="w-3 h-3 text-pink-400 flex-shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Audio / Video Features</h3>
            </div>
            <div className="space-y-1.5">
              {audioVideoFeatures.map(feat => (
                <div key={feat} className="flex items-center gap-2 text-xs text-slate-400">
                  <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
