import React from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowRight,
  Trash2,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments, deleteDocument } from '../store/slices/documentSlice';
import toast from 'react-hot-toast';

const MyDocuments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: documents, loading } = useSelector((state) => state.documents);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Erase this document from your library?')) {
      try {
        await dispatch(deleteDocument(id)).unwrap();
        toast.success('Document removed.');
      } catch {
        toast.error('Failed to delete document.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Knowledge Library</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Manage and search your indexed documents</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/documents')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          New Index
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 rounded-4xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950/20">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest border border-slate-700/50">
            <Filter size={14} />
            {filteredDocuments.length} Documents
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-950/30">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Document</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hidden md:table-cell">Pages / Words</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hidden lg:table-cell">Uploaded</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-slate-800 rounded w-48" /></td>
                    <td className="px-8 py-6 hidden md:table-cell"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    <td className="px-8 py-6 hidden lg:table-cell"><div className="h-4 bg-slate-800 rounded w-32" /></td>
                    <td className="px-8 py-6" />
                  </tr>
                ))
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-emerald-500/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all">
                          <FileText size={20} />
                        </div>
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400 font-bold uppercase">{doc.pageCount || 0} Pages</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{doc.wordCount || 0} Words</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <Clock size={14} />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/documents/${doc._id}`)}
                          className="p-2.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                          title="Open Analysis"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc._id)}
                          className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
                        <FileText size={32} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-tight">Search yielded no results</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
