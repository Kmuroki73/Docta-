import { useCallback, useState } from 'react';
import { Upload, FileText, Image, Video, Music, FileSpreadsheet } from 'lucide-react';
import { getAllAcceptedTypes } from '../lib/fileUtils';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}

const icons = [
  { icon: FileText, label: 'Docs' },
  { icon: FileSpreadsheet, label: 'Sheets' },
  { icon: Image, label: 'Images' },
  { icon: Video, label: 'Video' },
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

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
        <input type="file" multiple accept={getAllAcceptedTypes()} onChange={handleInput} className="hidden" />
        <Upload className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">Drop files or tap to upload</p>
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
      className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-8 sm:py-10 px-4 ${
        isDragging
          ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
          : 'border-white/15 bg-white/3 hover:border-blue-500/40 hover:bg-white/5 active:scale-[0.99]'
      }`}
    >
      <input type="file" multiple accept={getAllAcceptedTypes()} onChange={handleInput} className="hidden" />

      <div className={`w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mb-3 transition-transform ${isDragging ? 'scale-110' : ''}`}>
        <Upload className="w-5 h-5 text-blue-400" />
      </div>

      <p className="text-base font-semibold text-white mb-1">{isDragging ? 'Drop it!' : 'Drop files here'}</p>
      <p className="text-sm text-slate-400 mb-5">or tap to browse</p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {icons.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4">Max 100MB · All formats supported</p>
    </label>
  );
}
