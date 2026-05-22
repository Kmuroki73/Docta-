import { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentViewer from './components/DocumentViewer';
import AIAnalysis from './components/AIAnalysis';
import DocumentTools from './components/DocumentTools';
import NotesPanel from './components/NotesPanel';
import MediaPanel from './components/MediaPanel';
import type { ViewMode, UploadedFile, AnalysisResult } from './types';
import type { AutoNote } from './types';
import { getFileCategory } from './lib/fileUtils';
import { generateAnalysisFromText } from './lib/mockAnalysis';
import { LayoutDashboard, FileText, Brain, Wrench, StickyNote, Video, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [autoNotes, setAutoNotes] = useState<Record<string, AutoNote[]>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFile = files.find(f => f.id === selectedFileId) ?? null;
  const selectedAnalysis = selectedFileId ? analyses[selectedFileId] ?? null : null;
  const selectedAutoNotes = selectedFileId ? autoNotes[selectedFileId] ?? [] : [];

  const readFileText = useCallback((file: File): Promise<string> => {
    return new Promise(resolve => {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = e => resolve((e.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsText(file);
      } else {
        // For binary files (PDF, images, etc.) we can't read actual text client-side
        // We resolve with metadata so analysis is still file-specific
        resolve('');
      }
    });
  }, []);

  const handleFiles = useCallback((newFiles: File[]) => {
    const uploaded: UploadedFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file.type, file.name),
      progress: 0,
      status: 'processing' as const,
      analysisStatus: 'idle' as const,
    }));

    setFiles(prev => [...uploaded, ...prev]);
    if (uploaded.length > 0) setSelectedFileId(uploaded[0].id);

    uploaded.forEach(f => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => prev.map(pf =>
            pf.id === f.id ? { ...pf, progress: 100, status: 'ready' } : pf
          ));
        } else {
          setFiles(prev => prev.map(pf =>
            pf.id === f.id ? { ...pf, progress } : pf
          ));
        }
      }, 150);
    });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFileId || !selectedFile) return;

    setFiles(prev => prev.map(f =>
      f.id === selectedFileId ? { ...f, analysisStatus: 'analyzing' } : f
    ));

    const fileText = await readFileText(selectedFile.file);
    const delay = 1500 + Math.random() * 1000;

    setTimeout(() => {
      const result = generateAnalysisFromText(
        selectedFile.name,
        selectedFile.category,
        fileText,
        selectedFile.size
      );

      setAnalyses(prev => ({ ...prev, [selectedFileId]: result }));

      // Auto-generate notes from the analysis
      const notes: AutoNote[] = [
        ...result.key_insights.slice(0, 3).map((insight, i) => ({
          id: `auto-insight-${i}-${Date.now()}`,
          content: insight,
          color: 'blue',
          note_type: 'key point',
          source: 'AI Insight',
          is_pinned: i === 0,
          is_auto: true,
          created_at: new Date().toISOString(),
        })),
        ...result.action_items.slice(0, 2).map((item, i) => ({
          id: `auto-action-${i}-${Date.now()}`,
          content: item,
          color: 'green',
          note_type: 'action',
          source: 'Action Item',
          is_pinned: false,
          is_auto: true,
          created_at: new Date().toISOString(),
        })),
        {
          id: `auto-summary-${Date.now()}`,
          content: result.summary,
          color: 'yellow',
          note_type: 'summary',
          source: 'AI Summary',
          is_pinned: false,
          is_auto: true,
          created_at: new Date().toISOString(),
        },
      ];

      setAutoNotes(prev => ({ ...prev, [selectedFileId]: notes }));

      setFiles(prev => prev.map(f =>
        f.id === selectedFileId ? { ...f, analysisStatus: 'complete' } : f
      ));
    }, delay);
  }, [selectedFileId, selectedFile, readFileText]);

  const handleViewChange = (v: ViewMode) => {
    setView(v);
    setSidebarOpen(false);
  };

  const bottomNavItems = [
    { id: 'dashboard' as ViewMode, icon: LayoutDashboard, label: 'Home' },
    { id: 'viewer' as ViewMode, icon: FileText, label: 'Viewer' },
    { id: 'analysis' as ViewMode, icon: Brain, label: 'AI' },
    { id: 'tools' as ViewMode, icon: Wrench, label: 'Tools' },
    { id: 'notes' as ViewMode, icon: StickyNote, label: 'Notes' },
    { id: 'media' as ViewMode, icon: Video, label: 'Media' },
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-950 text-white overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => {
          const selected = Array.from(e.target.files || []);
          if (selected.length > 0) handleFiles(selected);
          e.target.value = '';
        }}
      />

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col bg-slate-900 border-r border-white/5 w-64 lg:w-56 pt-14 lg:pt-0">
            <div className="lg:hidden absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              view={view}
              onViewChange={handleViewChange}
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={id => { setSelectedFileId(id); setSidebarOpen(false); }}
              onUploadClick={() => { fileInputRef.current?.click(); setSidebarOpen(false); }}
            />
          </div>
        </div>

        {/* Main + Right panel */}
        <div className="flex flex-1 min-w-0">
          <main className="flex-1 flex flex-col min-w-0 min-h-0">
            {view === 'dashboard' && (
              <Dashboard
                files={files}
                onFiles={handleFiles}
                onSelectFile={id => setSelectedFileId(id)}
                onViewChange={setView}
              />
            )}
            {view === 'viewer' && (
              <DocumentViewer file={selectedFile} onFiles={handleFiles} />
            )}
            {view === 'analysis' && (
              <AIAnalysis
                file={selectedFile}
                analysis={selectedAnalysis}
                onAnalyze={handleAnalyze}
                onFiles={handleFiles}
                onViewNotes={() => handleViewChange('notes')}
              />
            )}
            {view === 'tools' && (
              <DocumentTools file={selectedFile} files={files} onFiles={handleFiles} />
            )}
            {view === 'notes' && (
              <NotesPanel
                file={selectedFile}
                autoNotes={selectedAutoNotes}
                onFiles={handleFiles}
                onGoToAnalysis={() => handleViewChange('analysis')}
              />
            )}
            {view === 'media' && (
              <MediaPanel files={files} onFiles={handleFiles} />
            )}
          </main>

          {/* Right context panel — desktop only */}
          {view !== 'dashboard' && view !== 'media' && (
            <aside className="hidden xl:flex w-60 flex-col border-l border-white/5 bg-slate-900/30 flex-shrink-0">
              {selectedFile ? (
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">
                      {selectedFile.type.startsWith('video/') ? '🎬'
                        : selectedFile.type.startsWith('audio/') ? '🎵'
                        : selectedFile.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{selectedFile.category}</p>
                    </div>
                  </div>
                  {selectedFile.status === 'processing' && (
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Processing...</span>
                        <span>{Math.round(selectedFile.progress)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${selectedFile.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-2 bg-white/3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-0.5">Size</p>
                      <p className="text-xs text-white">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <div className="p-2 bg-white/3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-0.5">Status</p>
                      <p className={`text-xs capitalize ${selectedFile.status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>{selectedFile.status}</p>
                    </div>
                    <div className="p-2 bg-white/3 rounded-lg col-span-2">
                      <p className="text-[10px] text-slate-500 mb-0.5">AI Analysis</p>
                      <p className={`text-xs capitalize ${selectedFile.analysisStatus === 'complete' ? 'text-green-400' : selectedFile.analysisStatus === 'analyzing' ? 'text-blue-400' : 'text-slate-400'}`}>
                        {selectedFile.analysisStatus === 'idle' ? 'Not started' : selectedFile.analysisStatus}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-white/5 text-center">
                  <p className="text-xs text-slate-500">No file selected</p>
                </div>
              )}
              <div className="p-3 border-b border-white/5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</p>
                <div className="space-y-1">
                  {([
                    { label: 'Analyze with AI', v: 'analysis' as ViewMode, accent: true },
                    { label: 'Open Viewer', v: 'viewer' as ViewMode },
                    { label: 'Tools', v: 'tools' as ViewMode },
                    { label: 'Notes', v: 'notes' as ViewMode },
                    { label: 'Media', v: 'media' as ViewMode },
                  ] as { label: string; v: ViewMode; accent?: boolean }[]).map(a => (
                    <button key={a.label} onClick={() => setView(a.v)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all ${a.accent ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20' : view === a.v ? 'bg-white/8 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              {files.length > 0 && (
                <div className="flex-1 overflow-y-auto p-3">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Files ({files.length})</p>
                  <div className="space-y-1">
                    {files.map(f => (
                      <button key={f.id} onClick={() => setSelectedFileId(f.id)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-all ${f.id === selectedFileId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                        <span className="text-sm flex-shrink-0">{f.type.startsWith('video/') ? '🎬' : f.type.startsWith('audio/') ? '🎵' : f.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                        <span className="text-xs text-slate-300 truncate flex-1">{f.name}</span>
                        {f.analysisStatus === 'complete' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                        {f.analysisStatus === 'analyzing' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden flex-shrink-0 flex items-stretch border-t border-white/8 bg-slate-950/95 backdrop-blur-xl safe-bottom" style={{ minHeight: '56px' }}>
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 relative transition-colors ${active ? 'text-blue-400' : 'text-slate-500'}`}
            >
              {active && (
                <div className="absolute top-0 inset-x-2 h-0.5 bg-blue-400 rounded-full" />
              )}
              <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${active ? 'bg-blue-500/15' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-semibold leading-none ${active ? 'text-blue-400' : 'text-slate-600'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
