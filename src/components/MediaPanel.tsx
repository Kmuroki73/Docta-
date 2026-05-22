import { useState } from 'react';
import { Video, Music, Image as ImageIcon, Wand2, RefreshCw, ChevronRight } from 'lucide-react';
import type { UploadedFile } from '../types';
import DropZone from './DropZone';
import { getFileCategory } from '../lib/fileUtils';

interface MediaPanelProps {
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
}

const caps = [
  {
    icon: Video, title: 'Video Analysis',
    desc: 'Transcripts, speaker ID, chapters, key moments.',
    formats: ['MP4','MOV','WEBM','AVI'], color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20',
  },
  {
    icon: Music, title: 'Audio & Podcasts',
    desc: 'Transcribe speech, extract quotes, identify speakers.',
    formats: ['MP3','WAV','M4A','OGG'], color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20',
  },
  {
    icon: ImageIcon, title: 'Image Intelligence',
    desc: 'OCR, object detection, chart reading, scene description.',
    formats: ['JPG','PNG','WEBP','SVG'], color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20',
  },
];

const imageFeatures = ['Object & scene detection','Text extraction (OCR)','Chart & graph reading','Face detection','Color palette analysis','Metadata extraction','Quality assessment','Format optimization'];
const avFeatures = ['Auto-transcription (50+ langs)','Speaker identification','Chapter detection','Key quotes extraction','Sentiment analysis','Noise detection','Export SRT/VTT','Generate summary'];

export default function MediaPanel({ files, onFiles }: MediaPanelProps) {
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, string>>({});

  const mediaFiles = files.filter(f => ['video','audio','image'].includes(getFileCategory(f.type, f.name)));

  function processFile(id: string) {
    setProcessing(p => ({ ...p, [id]: true }));
    setTimeout(() => {
      setProcessing(p => ({ ...p, [id]: false }));
      setResults(r => ({ ...r, [id]: 'Done — view in AI Analysis tab.' }));
    }, 2500);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Media & Image Intelligence</h2>
        <p className="text-slate-400 text-sm mb-5">Extract text, transcripts, and insights from any media file.</p>

        {/* Caps */}
        <div className="space-y-3 mb-6">
          {caps.map(cap => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className={`p-4 rounded-xl border ${cap.bg} ${cap.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${cap.bg} border ${cap.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cap.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-0.5">{cap.title}</h3>
                    <p className="text-xs text-slate-400 mb-2">{cap.desc}</p>
                    <div className="flex flex-wrap gap-1">
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

        <div className="mb-6">
          <DropZone onFiles={onFiles} compact />
        </div>

        {mediaFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">Media Files ({mediaFiles.length})</h3>
            <div className="space-y-2">
              {mediaFiles.map(file => {
                const cat = getFileCategory(file.type, file.name);
                const Icon = cat === 'video' ? Video : cat === 'audio' ? Music : ImageIcon;
                const color = cat === 'video' ? 'text-cyan-400' : cat === 'audio' ? 'text-yellow-400' : 'text-pink-400';
                const isProc = processing[file.id];
                return (
                  <div key={file.id} className="p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{file.name}</p>
                        {results[file.id] && <p className="text-xs text-green-400 mt-0.5">{results[file.id]}</p>}
                      </div>
                      <button onClick={() => processFile(file.id)} disabled={isProc}
                        className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500/20 disabled:opacity-50 flex-shrink-0">
                        {isProc
                          ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Analyzing...</span></>
                          : <><Wand2 className="w-3.5 h-3.5" />Analyze</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-white">Image Features</h3>
            </div>
            <div className="space-y-1.5">
              {imageFeatures.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <ChevronRight className="w-3 h-3 text-pink-400 flex-shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Video className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Audio / Video Features</h3>
            </div>
            <div className="space-y-1.5">
              {avFeatures.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
