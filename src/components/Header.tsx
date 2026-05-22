import { Star, Bell, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export default function Header({ onSearch, onMenuClick }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const notifications = [
    { id: 1, text: 'Analysis complete for "Q4 Report.pdf"', time: '2m ago', unread: true },
    { id: 2, text: 'Conversion finished: DOCX → PDF', time: '8m ago', unread: true },
    { id: 3, text: 'Merge complete: 3 files combined', time: '1h ago', unread: false },
  ];

  return (
    <header className="h-12 sm:h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 flex items-center px-2 sm:px-4 gap-2 z-30 relative flex-shrink-0">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
        </div>
        <span className="font-bold text-white text-base tracking-tight">Docta</span>
        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider hidden xs:block">Pro</span>
      </div>

      {/* Desktop search */}
      <div className="hidden md:block flex-1 max-w-md relative ml-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents, notes, insights..."
          value={searchValue}
          onChange={e => { setSearchValue(e.target.value); onSearch?.(e.target.value); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
        />
        {searchValue && (
          <button onClick={() => { setSearchValue(''); onSearch?.(''); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-lg leading-none">×</button>
        )}
      </div>

      {/* Mobile fullscreen search overlay */}
      {showSearch && (
        <div className="md:hidden absolute inset-0 bg-slate-900 flex items-center px-3 gap-2 z-10">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text" placeholder="Search..." value={searchValue} autoFocus
            onChange={e => { setSearchValue(e.target.value); onSearch?.(e.target.value); }}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={() => { setShowSearch(false); setSearchValue(''); onSearch?.(''); }}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-0.5 ml-auto">
        <button
          onClick={() => setShowSearch(true)}
          className="md:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-blue-400 cursor-pointer">Mark all read</span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${n.unread ? 'bg-blue-500/5' : ''}`}>
                    <p className="text-sm text-slate-200">{n.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <button className="flex items-center gap-1.5 ml-1 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-white leading-none">Alex</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Pro</p>
          </div>
        </button>
      </div>
    </header>
  );
}
