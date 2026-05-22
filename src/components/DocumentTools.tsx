import { useState } from 'react';
import {
  ArrowLeftRight, Layers, Minimize2, Scissors, Lock, Printer, PenTool,
  CreditCard as Edit3, CheckCircle, RefreshCw, Download, Plus, Trash2,
  FileText, Image, Music, Video, Table, Stamp, Shield, Crop, RotateCw, Type, Palette
} from 'lucide-react';
import type { ToolTab, ConversionFormat, UploadedFile } from '../types';
import DropZone from './DropZone';

interface DocumentToolsProps {
  file: UploadedFile | null;
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
}

const toolTabs: { id: ToolTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'convert',  label: 'Convert',  icon: ArrowLeftRight },
  { id: 'merge',    label: 'Merge',    icon: Layers },
  { id: 'compress', label: 'Compress', icon: Minimize2 },
  { id: 'split',    label: 'Split',    icon: Scissors },
  { id: 'protect',  label: 'Protect',  icon: Lock },
  { id: 'edit',     label: 'Edit',     icon: Edit3 },
  { id: 'sign',     label: 'Sign',     icon: PenTool },
  { id: 'print',    label: 'Print',    icon: Printer },
];

const outputFormats: { format: ConversionFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { format: 'pdf',      label: 'PDF',        icon: FileText },
  { format: 'docx',     label: 'Word',       icon: FileText },
  { format: 'xlsx',     label: 'Excel',      icon: Table },
  { format: 'pptx',     label: 'PowerPoint', icon: FileText },
  { format: 'txt',      label: 'Text',       icon: Type },
  { format: 'html',     label: 'HTML',       icon: FileText },
  { format: 'markdown', label: 'Markdown',   icon: FileText },
  { format: 'jpg',      label: 'JPEG',       icon: Image },
  { format: 'png',      label: 'PNG',        icon: Image },
  { format: 'svg',      label: 'SVG',        icon: Image },
  { format: 'mp3',      label: 'MP3',        icon: Music },
  { format: 'mp4',      label: 'MP4',        icon: Video },
];

function StatusBadge({ status }: { status: 'idle' | 'processing' | 'done' | 'error' }) {
  if (status === 'idle') return null;
  const cfg = {
    processing: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Processing...', spin: true },
    done:       { color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'Done', spin: false },
    error:      { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Error', spin: false },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${c.color}`}>
      {c.spin ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

export default function DocumentTools({ file, files, onFiles }: DocumentToolsProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>('convert');
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>('pdf');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [splitPages, setSplitPages] = useState('1-3,4-6,7-');
  const [password, setPassword] = useState('');
  const [compression, setCompression] = useState(70);
  const [copies, setCopies] = useState(1);
  const [layout, setLayout] = useState('portrait');

  function simulate() {
    setStatus('processing');
    setTimeout(() => setStatus('done'), 2000);
  }

  const TabBar = () => (
    <div className="flex overflow-x-auto scrollbar-none border-b border-white/5 flex-shrink-0">
      {toolTabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setStatus('idle'); }}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
              active ? 'border-blue-400 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  if (!file) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabBar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-lg font-bold text-white mb-2">Document Tools</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">Upload a document to convert, merge, compress, sign, and more.</p>
          <div className="w-full max-w-sm">
            <DropZone onFiles={onFiles} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <TabBar />

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">

        {/* Convert */}
        {activeTab === 'convert' && (
          <>
            <p className="text-xs text-slate-500">Converting: <span className="text-white font-medium break-all">{file.name}</span></p>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Output Format</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {outputFormats.map(fmt => {
                const Icon = fmt.icon;
                const sel = selectedFormat === fmt.format;
                return (
                  <button key={fmt.format} onClick={() => setSelectedFormat(fmt.format)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                      sel ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-medium">{fmt.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={simulate} disabled={status === 'processing'}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                {status === 'processing'
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />Converting...</>
                  : <><ArrowLeftRight className="w-4 h-4" />Convert to {selectedFormat.toUpperCase()}</>
                }
              </button>
              {status === 'done' && (
                <button className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
            <StatusBadge status={status} />
          </>
        )}

        {/* Merge */}
        {activeTab === 'merge' && (
          <>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Files to Merge</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="text-lg flex-shrink-0">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate font-medium">{file.name}</p>
                  <p className="text-xs text-slate-500">Primary</p>
                </div>
                <span className="text-[11px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex-shrink-0">1st</span>
              </div>
              {files.filter(f => f.id !== file.id).slice(0, 3).map((f, i) => (
                <div key={f.id} className="flex items-center gap-2.5 p-3 bg-white/3 border border-white/8 rounded-xl">
                  <span className="text-lg flex-shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{f.name}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{i + 2}nd</span>
                  <button className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
                <Plus className="w-4 h-4" /> Add files
              </button>
            </div>
            <button onClick={simulate} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Layers className="w-4 h-4" /> Merge
            </button>
            <StatusBadge status={status} />
          </>
        )}

        {/* Compress */}
        {activeTab === 'compress' && (
          <>
            <div className="p-4 bg-white/3 border border-white/8 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Original</span>
                <span className="text-white font-medium">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estimated</span>
                <span className="text-green-400 font-medium">{((file.size / 1024 / 1024) * (1 - compression / 100)).toFixed(1)} MB</span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Compression</span>
                  <span className="text-blue-400 font-medium">{compression}%</span>
                </div>
                <input type="range" min="10" max="90" value={compression}
                  onChange={e => setCompression(Number(e.target.value))}
                  className="w-full accent-blue-500" />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Low (best quality)</span><span>High (smallest)</span>
                </div>
              </div>
            </div>
            <button onClick={simulate} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Minimize2 className="w-4 h-4" /> Compress
            </button>
            <StatusBadge status={status} />
          </>
        )}

        {/* Split */}
        {activeTab === 'split' && (
          <>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Split Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {['By page range','Every N pages','By bookmark','Extract pages'].map(m => (
                <button key={m} className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/15 transition-all">{m}</button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Page ranges (e.g., 1-3, 4-6, 7-)</label>
              <input type="text" value={splitPages} onChange={e => setSplitPages(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <button onClick={simulate} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Scissors className="w-4 h-4" /> Split
            </button>
            <StatusBadge status={status} />
          </>
        )}

        {/* Protect */}
        {activeTab === 'protect' && (
          <>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
            </div>
            <div>
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Permissions</h3>
              {['Allow printing','Allow copying','Allow editing','Allow annotations'].map(p => (
                <label key={p} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 cursor-pointer">
                  <input type="checkbox" defaultChecked={p.includes('printing')} className="accent-blue-500 w-4 h-4" />
                  <span className="text-sm text-slate-300">{p}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Watermark text</label>
              <input type="text" placeholder="Optional watermark..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
            </div>
            <button onClick={simulate} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Shield className="w-4 h-4" /> Apply Protection
            </button>
            <StatusBadge status={status} />
          </>
        )}

        {/* Edit */}
        {activeTab === 'edit' && (
          <>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Edit Tools</h3>
            {[
              { icon: Type,     label: 'Add/Edit Text',    desc: 'Insert or modify text' },
              { icon: Image,    label: 'Insert Image',     desc: 'Add images to pages' },
              { icon: Palette,  label: 'Redact Content',   desc: 'Black out sensitive text' },
              { icon: Crop,     label: 'Crop Pages',       desc: 'Trim page margins' },
              { icon: RotateCw, label: 'Rotate Pages',     desc: 'Rotate pages' },
              { icon: Stamp,    label: 'Add Stamp',        desc: 'APPROVED, DRAFT stamps' },
            ].map(tool => {
              const Icon = tool.icon;
              return (
                <button key={tool.label} className="w-full flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl hover:border-blue-500/20 hover:bg-white/5 text-left transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{tool.label}</p>
                    <p className="text-xs text-slate-500">{tool.desc}</p>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* Sign */}
        {activeTab === 'sign' && (
          <>
            <div className="p-6 bg-white/3 border-2 border-dashed border-white/10 rounded-xl text-center">
              <PenTool className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-1">Draw your signature</p>
              <p className="text-xs text-slate-600">Tap and drag to sign</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/15 transition-all">Upload image</button>
              <button className="p-3 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/15 transition-all">Type signature</button>
            </div>
            <button onClick={simulate} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <PenTool className="w-4 h-4" /> Apply Signature
            </button>
            <StatusBadge status={status} />
          </>
        )}

        {/* Print */}
        {activeTab === 'print' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Copies</label>
                <input type="number" min="1" max="999" value={copies}
                  onChange={e => setCopies(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Layout</label>
                <select value={layout} onChange={e => setLayout(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Pages</label>
              <input type="text" defaultValue="All" placeholder="e.g. 1-5, 8"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
            </div>
            {['Double-sided','Collate','Color printing','Fit to page'].map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer py-1">
                <input type="checkbox" defaultChecked={opt === 'Collate' || opt === 'Fit to page'} className="accent-blue-500 w-4 h-4" />
                <span className="text-sm text-slate-300">{opt}</span>
              </label>
            ))}
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
          </>
        )}
      </div>
    </div>
  );
}
