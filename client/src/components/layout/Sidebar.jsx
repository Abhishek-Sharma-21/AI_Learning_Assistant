import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  X,
  Zap
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { selectIsPro, selectDaysRemaining } from '../../store/slices/planSlice';
import UpgradeModal from '../UpgradeModal';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location  = useLocation();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const isPro     = useSelector(selectIsPro);
  const daysLeft  = useSelector(selectDaysRemaining);
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Session terminated. Fly safe.');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Library', icon: FileText, path: '/dashboard/library' },
    { name: 'AI Chat', icon: MessageSquare, path: '/dashboard/chat' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0F172A] border-r border-slate-800/50 z-50 transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AI Assistant</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 grow">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
                <item.icon size={20} className={isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'} />
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        <div className="p-4 space-y-4">
          {/* Pro status or Upgrade card */}
          {isPro ? (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-amber-400 fill-amber-400" />
                <p className="text-xs font-bold text-amber-400 uppercase tracking-tight">Pro Active</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">All limits removed.</p>
              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((30 - daysLeft) / 30) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
               <p className="text-xs font-bold text-emerald-400 uppercase tracking-tight mb-1">Pro Plan</p>
               <p className="text-[10px] text-slate-400 leading-tight">Unlock advanced AI models and unlimited storage.</p>
               <button onClick={() => setShowUpgrade(true)} className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors">Upgrade Now</button>
            </div>
          )}
          <div className="pt-4 border-t border-slate-800/50">
            <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group">
              <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
