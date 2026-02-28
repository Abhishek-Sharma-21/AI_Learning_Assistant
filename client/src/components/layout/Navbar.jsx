import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, User, ChevronDown, CheckCheck, Trash2, FileText, X, Zap } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { markAllRead, clearAll, markRead } from '../../store/slices/notificationsSlice';
import { selectIsPro, selectDaysRemaining } from '../../store/slices/planSlice';

// ── helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const typeStyles = {
  success: 'border-l-emerald-500 bg-emerald-500/5',
  error:   'border-l-red-500 bg-red-500/5',
  info:    'border-l-blue-500 bg-blue-500/5',
};

// ── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ toggleSidebar }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const { items: documents } = useSelector((state) => state.documents);
  const isPro = useSelector(selectIsPro);
  const daysLeft = useSelector(selectDaysRemaining);

  const [userOpen, setUserOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [query,    setQuery]    = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const userRef   = useRef(null);
  const bellRef   = useRef(null);
  const searchRef = useRef(null);

  // Filtered results — match title case-insensitively
  const results = query.trim().length > 0
    ? documents.filter((d) => d.title?.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close all dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current   && !userRef.current.contains(e.target))   setUserOpen(false);
      if (bellRef.current   && !bellRef.current.contains(e.target))   setBellOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    window.document.addEventListener('mousedown', handler);
    return () => window.document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (doc) => {
    setQuery('');
    setSearchOpen(false);
    navigate(`/dashboard/documents/${doc._id}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
    if (e.key === 'Enter' && results.length > 0) handleSearchSelect(results[0]);
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 right-0 left-0 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 z-30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">

        {/* ── Left ── */}
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          {/* ── Search ── */}
          <div className="hidden md:block relative" ref={searchRef}>
            <div className={`flex items-center gap-3 px-3 py-2 bg-slate-900 border rounded-xl w-64 lg:w-96 transition-colors ${
              searchOpen ? 'border-emerald-500/50' : 'border-slate-800'
            }`}>
              <Search size={16} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search documents…"
                className="bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:ring-0 w-full focus:outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); setSearchOpen(false); }} className="text-slate-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results dropdown */}
            {searchOpen && query.trim() && (
              <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden z-50">
                {results.length > 0 ? (
                  <div className="py-1">
                    <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Documents</p>
                    {results.map((doc) => (
                      <button
                        key={doc._id}
                        onClick={() => handleSearchSelect(doc)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Search size={20} className="text-slate-700" />
                    <p className="text-sm text-slate-500">No documents matching <span className="text-slate-300 font-medium">"{query}"</span></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-3">

          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => { setBellOpen((v) => !v); if (!bellOpen) dispatch(markAllRead()); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg relative transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-white">Notifications</p>
                    <p className="text-[10px] text-slate-500">{notifications.length} total</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => dispatch(markAllRead())} title="Mark all read" className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors">
                      <CheckCheck size={14} />
                    </button>
                    <button onClick={() => dispatch(clearAll())} title="Clear all" className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <Bell size={28} className="text-slate-700 mb-3" />
                      <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                      <p className="text-[11px] text-slate-600 mt-1">AI activity will appear here</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => dispatch(markRead(n.id))}
                        className={`w-full text-left px-4 py-3 border-l-2 transition-colors hover:bg-slate-800/50 ${typeStyles[n.type] ?? typeStyles.info} ${n.read ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-base mt-0.5 shrink-0">{n.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                              {!n.read && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.time)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-3 p-1.5 hover:bg-slate-800 rounded-xl transition-all group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
                  {initials}
                </div>
                {isPro && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-md shadow-amber-400/40">
                    <Zap size={9} className="text-slate-900 fill-slate-900" />
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white leading-none">{user?.name || 'User'}</p>
                  {isPro && (
                    <span className="px-1.5 py-0.5 bg-amber-400/20 border border-amber-400/40 rounded text-[9px] font-bold text-amber-400 leading-none">PRO</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5 truncate max-w-[120px]">
                  {isPro ? `${daysLeft}d remaining` : (user?.email || 'Free Plan')}
                </p>
              </div>
              <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 hidden sm:block ${userOpen ? 'rotate-180' : ''}`} />
            </button>

            {userOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-none truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => { setUserOpen(false); navigate('/dashboard/settings'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-left">
                    <User size={16} className="shrink-0" />
                    <span className="font-medium">Profile Settings</span>
                  </button>
                  <div className="my-1.5 border-t border-slate-800" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-left">
                    <LogOut size={16} className="shrink-0" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
