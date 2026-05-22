import { useCallback, useState } from 'react';
import { Upload, FileText, Image, Video, Music, FileSpreadsheet } from 'lucide-react';
import { getAllAcceptedTypes } from '../lib/fileUtils';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}

const featureIcons = [
  { icon: FileText, label: 'PDFs & Docs' },
  { icon: FileSpreadsheet, label: 'Spreadsheets' },
  { icon: Image, label: 'Images' },
  { icon: Video, label: 'Videos' },
  { icon: Music, label: 'Audio' },
];

export default function DropZone({ onFiles, compact = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) onFiles(dropped);
  }, [onFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) onFiles(selected);
    e.target.value = '';
  }, [onFiles]);

  if (compact) {
    return (
      <label
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-white/15 bg-white/3 hover:border-blue-500/50 hover:bg-white/5'
        }`}
      >
        <input type="file" multiple accept={getAllAcceptedTypes()} onChange={handleFileInput} className="hidden" />
        <Upload className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">Drop files or click to upload</p>
          <p className="text-xs text-slate-500">PDF, Word, Excel, Images, Video, Audio</p>
        </div>
      </label>
    );
  }

  return (
    <label
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
        isDragging
          ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
          : 'border-white/15 bg-white/3 hover:border-blue-500/40 hover:bg-white/5'
      }`}
    >
      <input type="file" multiple accept={getAllAcceptedTypes()} onChange={handleFileInput} className="hidden" />

      <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
        <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mb-4 mx-auto">
          <Upload className="w-7 h-7 text-blue-400" />
        </div>
      </div>

      <p className="text-lg font-semibold text-white mb-1">
        {isDragging ? 'Drop it!' : 'Drop files here'}
      </p>
      <p className="text-sm text-slate-400 mb-6">or click to browse your files</p>

      <div className="flex items-center gap-3">
        {featureIcons.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 mt-4">Max 100MB per file · All formats supported</p>
    </label>
  );
}
