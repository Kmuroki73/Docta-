import { useState, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentViewer from './components/DocumentViewer';
import AIAnalysis from './components/AIAnalysis';
import DocumentTools from './components/DocumentTools';
import NotesPanel from './components/NotesPanel';
import MediaPanel from './components/MediaPanel';
import ChatPanel from './components/ChatPanel';
import type { ViewMode, UploadedFile, AnalysisResult } from './types';
import type { AutoNote } from './types';
import { getFileCategory } from './lib/fileUtils';
import { generateAnalysisFromText } from './lib/mockAnalysis';
import { LayoutDashboard, FileText, Brain, Wrench, StickyNote, Video, MessageSquare, X } from 'lucide-react';

const bottomNavItems = [
  { id: 'dashboard' as ViewMode, icon: LayoutDashboard, label: 'Home' },
  { id: 'viewer' as ViewMode, icon: FileText, label: 'Viewer' },
  { id: 'analysis' as ViewMode, icon: Brain, label: 'AI' },
  { id: 'chat' as ViewMode, icon: MessageSquare, label: 'Chat' },
  { id: 'notes' as ViewMode, icon: StickyNote, label: 'Notes' },
  { id: 'tools' as ViewMode, icon: Wrench, label: 'Tools' },
];

function AppInner() {
  const { user, loading } = useAuth();
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
    const delay = 1800 + Math.random() * 1200;

    setTimeout(() => {
      const result = generateAnalysisFromText(
        selectedFile.name,
        selectedFile.category,
        fileText,
        selectedFile.size
      );

      setAnalyses(prev => ({ ...prev, [selectedFileId]: result }));

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

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse" />
          <p className="text-xs text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

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
          <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col bg-slate-900 border-r border-white/5 w-64 lg:w-56 pt-12 lg:pt-0">
            <div className="lg:hidden absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
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

        {/* Main content */}
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
              onViewChat={() => handleViewChange('chat')}
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
          {view === 'chat' && (
            <ChatPanel
              file={selectedFile}
              analysis={selectedAnalysis}
              onFiles={handleFiles}
              onGoToAnalysis={() => handleViewChange('analysis')}
            />
          )}
        </main>
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
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors ${active ? 'text-blue-400' : 'text-slate-600'}`}
            >
              {active && <div className="absolute top-0 inset-x-1 h-0.5 bg-blue-400 rounded-full" />}
              <div className={`flex items-center justify-center w-8 h-7 rounded-xl transition-colors ${active ? 'bg-blue-500/15' : ''}`}>
                <Icon className="w-[17px] h-[17px]" />
              </div>
              <span className={`text-[9px] font-semibold leading-none ${active ? 'text-blue-400' : 'text-slate-600'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
