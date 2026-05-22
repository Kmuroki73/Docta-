import { Star, Bell, Settings, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Analysis complete for "Q4 Report.pdf"', time: '2m ago', unread: true },
    { id: 2, text: 'Conversion finished: DOCX → PDF', time: '8m ago', unread: true },
    { id: 3, text: 'Merge complete: 3 files combined', time: '1h ago', unread: false },
  ];

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-4 z-50 relative">
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Star className="w-4 h-4 text-white fill-white" strokeWidth={2} />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Docta</span>
        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Pro</span>
      </div>

      <div className="flex-1 max-w-lg relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents, notes, insights..."
          value={searchValue}
          onChange={e => {
            setSearchValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
        />
        {searchValue && (
          <button
            onClick={() => { setSearchValue(''); onSearch?.(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">Mark all read</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${n.unread ? 'bg-blue-500/5' : ''}`}>
                  <p className="text-sm text-slate-200">{n.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-white leading-none">Alex Chen</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Pro Plan</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
