import { useState } from 'react';
import { Plus, Trash2, Pin, PinOff, Search, StickyNote, CreditCard as Edit3, Check, X } from 'lucide-react';
import type { UploadedFile } from '../types';
import DropZone from './DropZone';

interface Note {
  id: string;
  content: string;
  color: string;
  page_number: number;
  note_type: string;
  is_pinned: boolean;
  created_at: string;
}

interface NotesPanelProps {
  file: UploadedFile | null;
  onFiles: (files: File[]) => void;
}

const noteColors = [
  { id: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  { id: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-400' },
  { id: 'green', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300', dot: 'bg-green-400' },
  { id: 'red', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-400' },
  { id: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400' },
];

const noteTypes = ['general', 'key point', 'question', 'action', 'reference'];

function getColorConfig(colorId: string) {
  return noteColors.find(c => c.id === colorId) || noteColors[0];
}

export default function NotesPanel({ file, onFiles }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', content: 'Review the methodology section in detail — aligns with our Q3 project goals.', color: 'yellow', page_number: 3, note_type: 'key point', is_pinned: true, created_at: new Date().toISOString() },
    { id: '2', content: 'Follow up with team on the data sources mentioned in Appendix A.', color: 'blue', page_number: 7, note_type: 'action', is_pinned: false, created_at: new Date().toISOString() },
    { id: '3', content: 'What is the sample size for the study? Seems low.', color: 'red', page_number: 5, note_type: 'question', is_pinned: false, created_at: new Date().toISOString() },
  ]);
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState('yellow');
  const [newType, setNewType] = useState('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  function addNote() {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      color: newColor,
      page_number: 1,
      note_type: newType,
      is_pinned: false,
      created_at: new Date().toISOString(),
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setIsAdding(false);
  }

  function deleteNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function togglePin(id: string) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, is_pinned: !n.is_pinned } : n));
  }

  function saveEdit(id: string) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: editContent } : n));
    setEditingId(null);
  }

  const filtered = notes.filter(n =>
    search ? n.content.toLowerCase().includes(search.toLowerCase()) : true
  ).sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <StickyNote className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Notes</h2>
            <p className="text-slate-400 text-sm">Upload a document to start taking notes.</p>
          </div>
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Notes</h2>
            <p className="text-xs text-slate-500 truncate mt-0.5">{file.name}</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Note
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* New note form */}
      {isAdding && (
        <div className="px-5 py-3 border-b border-white/5 bg-white/2">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write your note..."
            autoFocus
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none mb-2"
          />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {noteColors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setNewColor(c.id)}
                  className={`w-5 h-5 rounded-full ${c.dot} transition-transform ${newColor === c.id ? 'scale-125 ring-2 ring-white/30' : ''}`}
                />
              ))}
            </div>
            <select
              value={newType} onChange={e => setNewType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="ml-auto flex gap-1">
              <button onClick={() => setIsAdding(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <StickyNote className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{search ? 'No matching notes' : 'No notes yet — add your first one!'}</p>
          </div>
        )}

        {filtered.map(note => {
          const cc = getColorConfig(note.color);
          const isEditing = editingId === note.id;
          return (
            <div key={note.id} className={`p-3.5 rounded-xl border ${cc.bg} ${cc.border} group relative`}>
              {note.is_pinned && (
                <Pin className={`absolute top-3 right-10 w-3 h-3 ${cc.text} opacity-50`} />
              )}
              <div className="flex items-start justify-between gap-2">
                <div className={`flex items-center gap-1.5 mb-2`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${cc.dot}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${cc.text} opacity-70`}>{note.note_type}</span>
                  <span className="text-[10px] text-slate-600">• Page {note.page_number}</span>
                </div>
              </div>

              {isEditing ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none resize-none mb-2"
                  />
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded">Cancel</button>
                    <button onClick={() => saveEdit(note.id)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-all">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-200 leading-relaxed">{note.content}</p>
              )}

              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                  className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => togglePin(note.id)} className="p-1 text-slate-500 hover:text-white rounded transition-colors">
                  {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="ml-auto text-[10px] text-slate-600">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
