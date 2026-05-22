import { useState } from 'react';
import { Plus, Trash2, Pin, PinOff, Search, StickyNote, CreditCard as Edit3, Check, X, Sparkles, Brain } from 'lucide-react';
import type { UploadedFile, AutoNote } from '../types';
import DropZone from './DropZone';

interface UserNote {
  id: string;
  content: string;
  color: string;
  note_type: string;
  is_pinned: boolean;
  created_at: string;
}

interface NotesPanelProps {
  file: UploadedFile | null;
  autoNotes: AutoNote[];
  onFiles: (files: File[]) => void;
  onGoToAnalysis?: () => void;
}

const noteColors = [
  { id: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300', dot: 'bg-yellow-400', label: 'Yellow' },
  { id: 'blue',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-300',   dot: 'bg-blue-400',   label: 'Blue' },
  { id: 'green',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-300',  dot: 'bg-green-400',  label: 'Green' },
  { id: 'red',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-300',    dot: 'bg-red-400',    label: 'Red' },
  { id: 'cyan',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   text: 'text-cyan-300',   dot: 'bg-cyan-400',   label: 'Cyan' },
];

const autoNoteColorMap: Record<string, typeof noteColors[0]> = {
  blue:   noteColors[1],
  green:  noteColors[2],
  yellow: noteColors[0],
  red:    noteColors[3],
  cyan:   noteColors[4],
};

const noteTypes = ['general', 'key point', 'question', 'action', 'reference', 'summary'];

function getColorConfig(colorId: string) {
  return noteColors.find(c => c.id === colorId) || noteColors[0];
}

export default function NotesPanel({ file, autoNotes, onFiles, onGoToAnalysis }: NotesPanelProps) {
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState('yellow');
  const [newType, setNewType] = useState('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [tab, setTab] = useState<'all' | 'ai' | 'mine'>('all');

  function addNote() {
    if (!newNote.trim()) return;
    setUserNotes(prev => [{
      id: `user-${Date.now()}`,
      content: newNote.trim(),
      color: newColor,
      note_type: newType,
      is_pinned: false,
      created_at: new Date().toISOString(),
    }, ...prev]);
    setNewNote('');
    setIsAdding(false);
  }

  function deleteUserNote(id: string) {
    setUserNotes(prev => prev.filter(n => n.id !== id));
  }

  function togglePin(id: string) {
    setUserNotes(prev => prev.map(n => n.id === id ? { ...n, is_pinned: !n.is_pinned } : n));
  }

  function saveEdit(id: string) {
    setUserNotes(prev => prev.map(n => n.id === id ? { ...n, content: editContent } : n));
    setEditingId(null);
  }

  const filteredUser = userNotes.filter(n =>
    !search || n.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

  const filteredAuto = autoNotes.filter(n =>
    !search || n.content.toLowerCase().includes(search.toLowerCase())
  );

  const showAI = tab === 'all' || tab === 'ai';
  const showUser = tab === 'all' || tab === 'mine';

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
          <StickyNote className="w-7 h-7 text-yellow-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Notes</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xs">Upload a document to start taking notes. After AI analysis, notes are auto-generated from insights.</p>
        <div className="w-full max-w-sm">
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b border-white/5">
        {/* Title row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-white">Notes</h2>
            <p className="text-xs text-slate-500 truncate">{file.name}</p>
          </div>
          <button
            onClick={() => setIsAdding(v => !v)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs px-3 py-2 rounded-xl transition-all ml-2 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Note
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-2.5">
          {(['all', 'ai', 'mine'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                tab === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'ai' && <Sparkles className="w-3 h-3 text-blue-400" />}
              {t === 'ai' ? `AI (${autoNotes.length})` : t === 'mine' ? `Mine (${userNotes.length})` : `All (${autoNotes.length + userNotes.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* New note form */}
      {isAdding && (
        <div className="flex-shrink-0 px-3 sm:px-4 py-3 border-b border-white/5 bg-slate-900/50">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write your note..."
            autoFocus
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none mb-2.5"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5">
              {noteColors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setNewColor(c.id)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full ${c.dot} transition-transform ${newColor === c.id ? 'scale-125 ring-2 ring-white/40' : ''}`}
                />
              ))}
            </div>
            <select
              value={newType} onChange={e => setNewType(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none flex-1 min-w-0"
            >
              {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => setIsAdding(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={addNote}
              disabled={!newNote.trim()}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
            >
              <Check className="w-3.5 h-3.5" />Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-2.5">

        {/* AI-generated notes section */}
        {showAI && filteredAuto.length > 0 && (
          <div className="space-y-2">
            {tab === 'all' && (
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">AI Generated</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            )}
            {filteredAuto.map(note => {
              const cc = autoNoteColorMap[note.color] || noteColors[0];
              return (
                <div key={note.id} className={`p-3 rounded-xl border ${cc.bg} ${cc.border}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className={`w-3 h-3 ${cc.text} opacity-70 flex-shrink-0`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${cc.text} opacity-80`}>{note.note_type}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{note.source}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{note.content}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* AI notes placeholder when no analysis */}
        {showAI && autoNotes.length === 0 && (tab === 'ai' || tab === 'all') && (
          <div className={`p-4 rounded-xl border border-blue-500/15 bg-blue-500/5 text-center ${tab === 'all' && userNotes.length > 0 ? '' : ''}`}>
            <Brain className="w-8 h-8 text-blue-500/40 mx-auto mb-2" />
            <p className="text-xs text-slate-500 mb-3">No AI notes yet.<br />Run AI Analysis to auto-generate notes from your document.</p>
            {onGoToAnalysis && (
              <button onClick={onGoToAnalysis} className="flex items-center gap-1.5 mx-auto text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20">
                <Sparkles className="w-3 h-3" />
                Run AI Analysis
              </button>
            )}
          </div>
        )}

        {/* User notes section */}
        {showUser && filteredUser.length > 0 && (
          <div className="space-y-2">
            {tab === 'all' && filteredAuto.length > 0 && (
              <div className="flex items-center gap-2 mb-1 mt-2">
                <StickyNote className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">My Notes</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            )}
            {filteredUser.map(note => {
              const cc = getColorConfig(note.color);
              const isEditing = editingId === note.id;
              return (
                <div key={note.id} className={`p-3 rounded-xl border ${cc.bg} ${cc.border}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${cc.dot} flex-shrink-0`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${cc.text} opacity-80`}>{note.note_type}</span>
                    {note.is_pinned && <Pin className={`w-3 h-3 ${cc.text} opacity-60 ml-1`} />}
                    <span className="text-[10px] text-slate-600 ml-auto">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>

                  {isEditing ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3} autoFocus
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none resize-none mb-2"
                      />
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg">Cancel</button>
                        <button onClick={() => saveEdit(note.id)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition-all">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-200 leading-relaxed">{note.content}</p>
                  )}

                  <div className="flex items-center gap-0.5 mt-2.5 pt-2 border-t border-white/5">
                    <button onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => togglePin(note.id)} className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors">
                      {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteUserNote(note.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state for "mine" tab */}
        {showUser && filteredUser.length === 0 && tab === 'mine' && (
          <div className="py-10 text-center">
            <StickyNote className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{search ? 'No matching notes' : 'No personal notes yet'}</p>
            {!search && (
              <button onClick={() => setIsAdding(true)} className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline">Add your first note</button>
            )}
          </div>
        )}

        {/* Empty state for "all" tab */}
        {tab === 'all' && filteredAuto.length === 0 && filteredUser.length === 0 && (
          <div className="py-10 text-center">
            <StickyNote className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{search ? 'No matching notes' : 'No notes yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
