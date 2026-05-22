import { useState } from 'react';
import { ArrowLeftRight, Layers, Minimize2, Scissors, Lock, Printer, PenTool, CreditCard as Edit3, CheckCircle, RefreshCw, Download, Plus, Trash2, FileText, Image, Music, Video, Table, Stamp, Shield, Crop, RotateCw, Type, Palette } from 'lucide-react';
import type { ToolTab, ConversionFormat } from '../types';
import type { UploadedFile } from '../types';
import DropZone from './DropZone';

interface DocumentToolsProps {
  file: UploadedFile | null;
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
}

const toolTabs: { id: ToolTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'convert', label: 'Convert', icon: ArrowLeftRight },
  { id: 'merge', label: 'Merge', icon: Layers },
  { id: 'compress', label: 'Compress', icon: Minimize2 },
  { id: 'split', label: 'Split', icon: Scissors },
  { id: 'protect', label: 'Protect', icon: Lock },
  { id: 'edit', label: 'Edit', icon: Edit3 },
  { id: 'sign', label: 'Sign', icon: PenTool },
  { id: 'print', label: 'Print', icon: Printer },
];

const outputFormats: { format: ConversionFormat; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { format: 'pdf', label: 'PDF', icon: FileText, desc: 'Universal document format' },
  { format: 'docx', label: 'Word', icon: FileText, desc: 'Microsoft Word document' },
  { format: 'xlsx', label: 'Excel', icon: Table, desc: 'Spreadsheet format' },
  { format: 'pptx', label: 'PowerPoint', icon: FileText, desc: 'Presentation slides' },
  { format: 'txt', label: 'Plain Text', icon: Type, desc: 'Simple text file' },
  { format: 'html', label: 'HTML', icon: FileText, desc: 'Web page format' },
  { format: 'markdown', label: 'Markdown', icon: FileText, desc: 'Markdown document' },
  { format: 'jpg', label: 'JPEG Image', icon: Image, desc: 'Compressed image' },
  { format: 'png', label: 'PNG Image', icon: Image, desc: 'Lossless image' },
  { format: 'svg', label: 'SVG', icon: Image, desc: 'Vector graphic' },
  { format: 'mp3', label: 'MP3 Audio', icon: Music, desc: 'Extract audio' },
  { format: 'mp4', label: 'MP4 Video', icon: Video, desc: 'Video format' },
];

function StatusBadge({ status }: { status: 'idle' | 'processing' | 'done' | 'error' }) {
  if (status === 'idle') return null;
  const config = {
    processing: { color: 'text-blue-400 bg-blue-500/10', label: 'Processing...', spin: true },
    done: { color: 'text-green-400 bg-green-500/10', label: 'Complete', spin: false },
    error: { color: 'text-red-400 bg-red-500/10', label: 'Error', spin: false },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${c.color}`}>
      {c.spin ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

export default function DocumentTools({ file, files, onFiles }: DocumentToolsProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>('convert');
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>('pdf');
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [_mergeFiles] = useState<string[]>([]);
  const [splitPages, setSplitPages] = useState('1-3,4-6,7-');
  const [password, setPassword] = useState('');
  const [compressionLevel, setCompressionLevel] = useState(70);
  const [printCopies, setPrintCopies] = useState(1);
  const [printLayout, setPrintLayout] = useState('portrait');

  function simulateAction() {
    setConversionStatus('processing');
    setTimeout(() => setConversionStatus('done'), 2000);
  }

  if (!file) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto">
          {toolTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Document Tools</h2>
              <p className="text-slate-400 text-sm">Upload a document to convert, merge, compress, sign, and more.</p>
            </div>
            <DropZone onFiles={onFiles} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto border-b border-white/5">
        {toolTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setConversionStatus('idle'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Convert */}
        {activeTab === 'convert' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Converting: <span className="text-white">{file.name}</span></p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Output Format</h3>
              <div className="grid grid-cols-2 gap-2">
                {outputFormats.map(fmt => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.format}
                      onClick={() => setSelectedFormat(fmt.format)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                        selectedFormat === fmt.format
                          ? 'border-blue-500/50 bg-blue-500/10 text-white'
                          : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/15 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">{fmt.label}</p>
                        <p className="text-[10px] opacity-60">{fmt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={simulateAction}
                disabled={conversionStatus === 'processing'}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                {conversionStatus === 'processing' ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Converting...</>
                ) : (
                  <><ArrowLeftRight className="w-4 h-4" /> Convert to {selectedFormat.toUpperCase()}</>
                )}
              </button>
              {conversionStatus === 'done' && (
                <button className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  <Download className="w-4 h-4" /> Download
                </button>
              )}
            </div>
            <StatusBadge status={conversionStatus} />
          </div>
        )}

        {/* Merge */}
        {activeTab === 'merge' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Files to Merge</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">📄</div>
                <div className="flex-1">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">Primary document</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">1st</span>
              </div>
              {files.filter(f => f.id !== file.id).slice(0, 3).map((f, i) => (
                <div key={f.id} className="flex items-center gap-2 p-3 bg-white/3 border border-white/8 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">📄</div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 truncate">{f.name}</p>
                  </div>
                  <span className="text-xs text-slate-500">{i + 2}nd</span>
                  <button className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
                <Plus className="w-4 h-4" /> Add more files
              </button>
            </div>
            <button onClick={simulateAction} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Layers className="w-4 h-4" /> Merge Documents
            </button>
            <StatusBadge status={conversionStatus} />
          </div>
        )}

        {/* Compress */}
        {activeTab === 'compress' && (
          <div className="space-y-4">
            <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-400">Original size</span>
                <span className="text-white font-medium">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estimated output</span>
                <span className="text-green-400 font-medium">{((file.size / 1024 / 1024) * (1 - compressionLevel / 100)).toFixed(1)} MB</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Compression level</span>
                  <span className="text-blue-400 font-medium">{compressionLevel}% reduction</span>
                </div>
                <input
                  type="range" min="10" max="90" value={compressionLevel}
                  onChange={e => setCompressionLevel(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Low (best quality)</span>
                  <span>High (smallest size)</span>
                </div>
              </div>
            </div>
            <button onClick={simulateAction} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Minimize2 className="w-4 h-4" /> Compress File
            </button>
            <StatusBadge status={conversionStatus} />
          </div>
        )}

        {/* Split */}
        {activeTab === 'split' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Split Method</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['By page range', 'Every N pages', 'By bookmark', 'Extract pages'].map(method => (
                  <button key={method} className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/15 transition-all">
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Page ranges (e.g., 1-3, 4-6, 7-)</label>
              <input
                type="text" value={splitPages} onChange={e => setSplitPages(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <button onClick={simulateAction} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Scissors className="w-4 h-4" /> Split Document
            </button>
            <StatusBadge status={conversionStatus} />
          </div>
        )}

        {/* Protect */}
        {activeTab === 'protect' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Permissions</h3>
              {['Allow printing', 'Allow copying text', 'Allow editing', 'Allow annotations'].map(perm => (
                <label key={perm} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={perm.includes('printing')} className="accent-blue-500" />
                  <span className="text-sm text-slate-300">{perm}</span>
                </label>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Watermark</h3>
              <input
                type="text" placeholder="Add watermark text (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            <button onClick={simulateAction} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Shield className="w-4 h-4" /> Apply Protection
            </button>
            <StatusBadge status={conversionStatus} />
          </div>
        )}

        {/* Edit */}
        {activeTab === 'edit' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Edit Tools</h3>
            {[
              { icon: Type, label: 'Add/Edit Text', desc: 'Insert or modify text blocks' },
              { icon: Image, label: 'Insert Image', desc: 'Add images to document' },
              { icon: Palette, label: 'Redact Content', desc: 'Permanently black out sensitive text' },
              { icon: Crop, label: 'Crop Pages', desc: 'Trim page margins' },
              { icon: RotateCw, label: 'Rotate Pages', desc: 'Rotate individual or all pages' },
              { icon: Stamp, label: 'Add Stamp', desc: 'Apply stamps like APPROVED, DRAFT' },
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
          </div>
        )}

        {/* Sign */}
        {activeTab === 'sign' && (
          <div className="space-y-4">
            <div className="p-8 bg-white/3 border-2 border-dashed border-white/10 rounded-xl text-center">
              <PenTool className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-1">Draw your signature</p>
              <p className="text-xs text-slate-600">Click and drag to sign</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/15 transition-all">
                Upload signature image
              </button>
              <button className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/15 transition-all">
                Type signature
              </button>
            </div>
            <button onClick={simulateAction} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <PenTool className="w-4 h-4" /> Apply Signature
            </button>
            <StatusBadge status={conversionStatus} />
          </div>
        )}

        {/* Print */}
        {activeTab === 'print' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Copies</label>
                <input
                  type="number" min="1" max="999" value={printCopies}
                  onChange={e => setPrintCopies(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Layout</label>
                <select
                  value={printLayout} onChange={e => setPrintLayout(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Pages</label>
              <input
                type="text" defaultValue="All" placeholder="e.g., 1-5, 8, 11-13"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            {['Double-sided', 'Collate', 'Color printing', 'Fit to page'].map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={opt === 'Collate' || opt === 'Fit to page'} className="accent-blue-500" />
                <span className="text-sm text-slate-300">{opt}</span>
              </label>
            ))}
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
