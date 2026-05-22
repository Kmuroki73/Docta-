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
import { getFileCategory } from './lib/fileUtils';
import { generateMockAnalysis } from './lib/mockAnalysis';

export default function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFile = files.find(f => f.id === selectedFileId) ?? null;
  const selectedAnalysis = selectedFileId ? analyses[selectedFileId] ?? null : null;

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

    if (uploaded.length > 0) {
      setSelectedFileId(uploaded[0].id);
    }

    uploaded.forEach(f => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, progress: 100, status: 'ready' } : pf));
        } else {
          setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, progress } : pf));
        }
      }, 150);
    });
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!selectedFileId || !selectedFile) return;

    setFiles(prev => prev.map(f =>
      f.id === selectedFileId ? { ...f, analysisStatus: 'analyzing' } : f
    ));

    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const category = getFileCategory(selectedFile.type, selectedFile.name);
      const result = generateMockAnalysis(selectedFile.name, category);
      setAnalyses(prev => ({ ...prev, [selectedFileId]: result }));
      setFiles(prev => prev.map(f =>
        f.id === selectedFileId ? { ...f, analysisStatus: 'complete' } : f
      ));
    }, delay);
  }, [selectedFileId, selectedFile]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
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

      <Header />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          view={view}
          onViewChange={setView}
          files={files}
          selectedFileId={selectedFileId}
          onSelectFile={setSelectedFileId}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        <div className="flex flex-1 min-w-0">
          {/* Main panel */}
          <main className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-white/5">
            {view === 'dashboard' && (
              <Dashboard
                files={files}
                onFiles={handleFiles}
                onSelectFile={id => { setSelectedFileId(id); }}
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
              />
            )}
            {view === 'tools' && (
              <DocumentTools file={selectedFile} files={files} onFiles={handleFiles} />
            )}
            {view === 'notes' && (
              <NotesPanel file={selectedFile} onFiles={handleFiles} />
            )}
            {view === 'media' && (
              <MediaPanel files={files} onFiles={handleFiles} />
            )}
          </main>

          {/* Right context panel */}
          {view !== 'dashboard' && view !== 'media' && (
            <aside className="w-64 flex flex-col border-l border-white/5 bg-slate-900/30 flex-shrink-0">
              {selectedFile ? (
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">
                      {selectedFile.type.startsWith('video/') ? '🎬' :
                       selectedFile.type.startsWith('audio/') ? '🎵' :
                       selectedFile.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{selectedFile.category}</p>
                    </div>
                  </div>

                  {selectedFile.status === 'processing' && (
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(selectedFile.progress)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-200"
                          style={{ width: `${selectedFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-2 bg-white/3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-0.5">Size</p>
                      <p className="text-xs text-white">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="p-2 bg-white/3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-0.5">Status</p>
                      <p className={`text-xs capitalize ${selectedFile.status === 'ready' ? 'text-green-400' : selectedFile.status === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {selectedFile.status}
                      </p>
                    </div>
                    <div className="p-2 bg-white/3 rounded-lg col-span-2">
                      <p className="text-[10px] text-slate-500 mb-0.5">AI Analysis</p>
                      <p className={`text-xs capitalize ${
                        selectedFile.analysisStatus === 'complete' ? 'text-green-400' :
                        selectedFile.analysisStatus === 'analyzing' ? 'text-blue-400' :
                        'text-slate-400'
                      }`}>
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
                    { label: 'Open in Viewer', v: 'viewer' as ViewMode },
                    { label: 'Convert Format', v: 'tools' as ViewMode },
                    { label: 'Add Note', v: 'notes' as ViewMode },
                    { label: 'Media / Images', v: 'media' as ViewMode },
                  ] as { label: string; v: ViewMode; accent?: boolean }[]).map(action => (
                    <button
                      key={action.label}
                      onClick={() => setView(action.v)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                        action.accent
                          ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20'
                          : view === action.v
                          ? 'bg-white/8 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {files.length > 0 && (
                <div className="flex-1 overflow-y-auto p-3">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Files ({files.length})</p>
                  <div className="space-y-1">
                    {files.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFileId(f.id)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-all ${
                          f.id === selectedFileId ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="text-sm flex-shrink-0">
                          {f.type.startsWith('video/') ? '🎬' :
                           f.type.startsWith('audio/') ? '🎵' :
                           f.type.startsWith('image/') ? '🖼️' : '📄'}
                        </span>
                        <span className="text-xs text-slate-300 truncate flex-1">{f.name}</span>
                        {f.analysisStatus === 'complete' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        )}
                        {f.analysisStatus === 'analyzing' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
