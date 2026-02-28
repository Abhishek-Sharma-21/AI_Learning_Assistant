import React from 'react';
import {
  Plus,
  FileText,
  MessageSquare,
  TrendingUp,
  Zap,
  Bell,
  ArrowRight,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments, deleteDocument } from '../store/slices/documentSlice';
import { selectIsPro } from '../store/slices/planSlice';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: documents, loading } = useSelector((state) => state.documents);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 4;

  const isPro = useSelector(selectIsPro);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const stats = [
    { 
      label: 'Total Documents', value: documents.length.toString(), 
      icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
      onClick: () => navigate('/dashboard/library')
    },
    { 
      label: 'AI Chat Access', value: isPro ? 'Unlimited' : '10 / session', 
      icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-500/10',
      onClick: () => navigate('/dashboard/chat')
    },
    { 
      label: 'Current Plan', value: isPro ? 'Pro Active' : 'Free Demo', 
      icon: isPro ? Zap : TrendingUp, color: isPro ? 'text-amber-400' : 'text-emerald-400', bg: isPro ? 'bg-amber-400/10' : 'bg-emerald-400/10',
      onClick: () => navigate('/dashboard/settings')
    },
    { 
      label: 'Unread Alerts', value: unreadCount.toString(), 
      icon: Bell, color: 'text-emerald-300', bg: 'bg-emerald-300/10',
      onClick: () => toast('Click the bell icon in the top right to view alerts.', { icon: '🔔' })
    },
  ];

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanentely erase this document? This cannot be undone.')) {
      try {
        await dispatch(deleteDocument(id)).unwrap();
        toast.success('Document purged from archives.');
      } catch {
        toast.error('Deletion protocol failed.');
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ready to accelerate your learning today?</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/documents')}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            onClick={stat.onClick}
            className="p-6 bg-slate-900/40 border border-slate-800/50 rounded-4xl hover:border-emerald-500/30 hover:bg-slate-800/40 transition-all duration-300 group hover:-translate-y-1 shadow-2xl cursor-pointer"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Documents */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-4xl flex flex-col shadow-2xl overflow-hidden min-h-[400px]">
          <div className="px-8 py-6 border-b border-slate-800/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" />
              Recent Documents
            </h3>
            <button 
              onClick={() => navigate('/dashboard/library')}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-800/50 grow">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="px-8 py-5 flex items-center gap-5 animate-pulse">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl" />
                  <div className="grow space-y-2">
                    <div className="h-4 bg-slate-800 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-800 rounded-full w-1/4" />
                  </div>
                </div>
              ))
            ) : documents.length > 0 ? (
              documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc) => (
                <div 
                  key={doc._id} 
                  onClick={() => navigate(`/dashboard/documents/${doc._id}`)}
                  className="px-8 py-5 flex items-center justify-between hover:bg-emerald-500/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{doc.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest leading-none">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-800/80 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-700/50 group-hover:border-emerald-500/20 group-hover:text-emerald-400/70 transition-all">
                      PDF
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, doc._id)}
                      className="p-2 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ArrowRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-4">
                 <div className="w-16 h-16 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600">
                    <FileText size={32} />
                 </div>
                 <div className="space-y-1">
                   <p className="text-slate-300 font-bold uppercase tracking-tight">No documents captured yet</p>
                   <p className="text-xs text-slate-500 max-w-[240px]">Upload your first PDF to begin your AI-accelerated learning journey.</p>
                 </div>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {documents.length > itemsPerPage && (
            <div className="px-8 py-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-950/20">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 Showing {Math.min(documents.length, 1 + (currentPage-1)*itemsPerPage)}-{Math.min(documents.length, currentPage*itemsPerPage)} of {documents.length}
               </p>
               <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-all disabled:opacity-20"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={currentPage * itemsPerPage >= documents.length}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-all disabled:opacity-20"
                  >
                    <ChevronRight size={16} />
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
