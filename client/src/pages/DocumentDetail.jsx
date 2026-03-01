import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateStudyNotesPDF } from '../utils/generateStudyNotesPDF';
import { 
  FileText, 
  Layout, 
  Layers, 
  Hash, 
  MessageSquare, 
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  BrainCircuit,
  HelpCircle,
  Copy,
  Download,
  Share2,
  Trash2,
  Check
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocumentById, generateSummaryWithFormat, extractTopics, analyzeDocument, deleteDocument, generateQuiz } from '../store/slices/documentSlice';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

const DocumentDetail = () => {
  const { id: documentId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('home');
  const [shareCopied, setShareCopied] = useState(false);
  const navigate = useNavigate();
  
  const { selectedItem: document, loading, analyzing, error } = useSelector((state) => state.documents);
  const { token } = useSelector((state) => state.auth);

  // Chat State
  const defaultWelcome = { role: 'assistant', content: "Hello! I've fully indexed this document. You can ask me to explain specific concepts, summarize sections, or generate analogies. What would you like to explore first?" };
  const [messages, setMessages] = useState([defaultWelcome]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!token || !documentId) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/chat`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = await res.json();
        if (history && history.length > 0) {
          setMessages(history);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchChatHistory();
  }, [documentId, token]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setShareCopied(false), 2000);
      }).catch(() => toast.error('Failed to copy link.'));
    } else {
      const el = window.document.createElement('textarea');
      el.value = url;
      window.document.body.appendChild(el);
      el.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(el);
      setShareCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!document) return;
    const blocked = generateStudyNotesPDF(document);
    if (blocked) toast.error('Pop-up blocked — allow pop-ups and try again.');
    else toast.success('Print dialog opened — choose "Save as PDF"!');
  };

  const handleFullAnalysis = () => {
    toast.promise(
      dispatch(analyzeDocument(documentId)).unwrap(),
      {
        loading: 'Synthesizing knowledge...',
        success: 'Analysis complete. Insights are now live.',
        error: 'Analysis failed. Check your connection.',
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 5000,
          icon: '🧠',
        },
      }
    );
  };

  const handleDelete = async () => {
    if (window.confirm('WARNING: Initiating complete data purge for this document. This action is irreversible. Proceed?')) {
      try {
        await dispatch(deleteDocument(documentId)).unwrap();
        toast.success('Document purged successfully.');
        navigate('/dashboard');
      } catch {
        toast.error('Purge failed. Access denied.');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question: userMessage.content,
          history: messages.slice(-5) 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Chat Error:', error);
      toast.error('AI response failed. Try again.');
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request." }]);
    } finally {
      setChatLoading(false);
    }
  };

  React.useEffect(() => {
    dispatch(fetchDocumentById(documentId));
  }, [dispatch, documentId]);

  if (loading) return (
     <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
       <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Calibrating workspace...</p>
     </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto p-12 bg-red-500/5 border border-red-500/20 rounded-4xl text-center">
       <h2 className="text-2xl font-bold text-white mb-4">Connection Terminated</h2>
       <p className="text-slate-400 mb-8">{error}</p>
       <button onClick={() => window.location.reload()} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-500/20 active:scale-95">Re-establish Pulse</button>
    </div>
  );

  const tabs = [
    { id: 'home', name: 'Home', icon: Layout },
    { id: 'summary', name: 'Summary', icon: FileText },
    { id: 'topics', name: 'Topics', icon: Hash },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
    { id: 'quiz', name: 'Quiz', icon: HelpCircle },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab document={document} setActiveTab={setActiveTab} />;
      case 'summary': return <SummaryTab document={document} />;
      case 'topics': return <TopicsTab document={document} setActiveTab={setActiveTab} setChatInput={setChatInput} />;
      case 'flashcards': return <FlashcardsTab document={document} />;
      case 'quiz': return <QuizTab document={document} />;
      case 'chat': return (
        <ChatTab 
          messages={messages} 
          chatInput={chatInput} 
          setChatInput={setChatInput} 
          handleSendMessage={handleSendMessage} 
          chatLoading={chatLoading}
          docTitle={document?.title}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link to="/dashboard/documents" className="text-slate-500 hover:text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Documents
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">{document?.title}</h1>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border shadow-lg transition-all ${analyzing ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'}`}>
              {analyzing ? 'Analyzing...' : 'Analysis Ready'}
            </span>
          </div>
          <div className="flex items-center gap-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500/50" /> {new Date(document?.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><FileText size={14} className="text-teal-500/50" /> Analysis Complete</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={handleDelete}
             className="p-3 bg-slate-900 border border-slate-800/50 text-slate-500 hover:text-red-400 hover:border-red-500/30 rounded-2xl transition-all active:scale-90"
           >
             <Trash2 size={20} />
           </button>
           <button
             onClick={handleShare}
             title="Copy link"
             className={`p-3 bg-slate-900 border rounded-2xl transition-all active:scale-90 ${
               shareCopied
                 ? 'border-emerald-500/40 text-emerald-400'
                 : 'border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700'
             }`}
           >
             {shareCopied ? <Check size={20} /> : <Share2 size={20} />}
           </button>
           <button
             onClick={handleDownload}
             title="Download study notes"
             className="p-3 bg-slate-900 border border-slate-800/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 rounded-2xl transition-all active:scale-90"
           >
             <Download size={20} />
           </button>
           <button 
             onClick={handleFullAnalysis}
             disabled={analyzing}
             className="flex items-center gap-3 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group disabled:opacity-50"
           >
             <BrainCircuit size={20} className={`${analyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
             <span>Refine Analysis</span>
           </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/50 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-8 py-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap relative
              ${activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}
            `}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            )}
            <tab.icon size={18} className={activeTab === tab.id ? 'text-emerald-400' : 'text-slate-600'} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

/* --- Tab Components --- */

const HomeTab = ({ document, setActiveTab }) => {
  const features = [
    { id: 'summary', name: 'Generate Summary', desc: 'Get a concise overview of key concepts', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'topics', name: 'Extract Topics', desc: 'Identify core themes and categories', icon: Hash, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { id: 'flashcards', name: 'Create Flashcards', desc: 'Master knowledge with active recall', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'quiz', name: 'Start Quiz', desc: 'test your understanding with AI MCQs', icon: HelpCircle, color: 'text-emerald-300', bg: 'bg-emerald-300/10' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Words', value: document?.wordCount || '...', icon: TrendingUp },
          { label: 'Pages', value: document?.pageCount || '...', icon: Layout },
          { label: 'Uploaded', value: new Date(document?.createdAt).toLocaleDateString(), icon: Clock },
          { label: 'AI Readiness', value: 'High', icon: Award },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/40 border border-slate-800/50 rounded-3xl shadow-xl backdrop-blur-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800/50 rounded-2xl text-emerald-500">
                  <stat.icon size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                   <p className="text-xl font-bold text-slate-100">{stat.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-10 bg-slate-900/40 border border-slate-800/50 rounded-4xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={120} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-emerald-500" size={24} />
              AI Enrichment Suite
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-10 max-w-lg">
              Explore your document using our advanced AI modules. Choose a path below to begin your accelerated learning journey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id)}
                  className="p-6 bg-slate-950/40 border border-slate-800/50 rounded-3xl text-left hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all group flex items-start gap-5"
                >
                  <div className={`p-4 ${f.bg} ${f.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <f.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 uppercase tracking-tight mb-1">{f.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-emerald-600/10 to-teal-600/20 border border-emerald-500/20 rounded-4xl p-10 flex flex-col justify-between shadow-2xl group relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 blur-3xl group-hover:blur-2xl transition-all"></div>
          <div>
            <div className="w-16 h-16 bg-white text-slate-950 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
               <MessageSquare size={32} className="fill-slate-950" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Direct Dialogue</h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-10">
              Skip the reading and ask exactly what you need. Our AI has fully indexed "{document?.title}" and is ready for your questions.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('chat')}
            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-xl flex items-center justify-center gap-3 group/btn active:scale-95"
          >
            Launch Chat <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryTab = ({ document }) => {
  const dispatch = useDispatch();
  const [format, setFormat] = useState('Detailed');
  const { generatingSummary } = useSelector((state) => state.documents);

  const handleGenerate = () => {
    dispatch(generateSummaryWithFormat({ id: document._id, format }));
  };

  if (!document?.summary?.mainSummary && !generatingSummary) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-10 animate-in fade-in zoom-in duration-500">
         <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <FileText size={40} />
         </div>
         <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Professional Summary</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">Generate a structured overview of this document's most critical insights.</p>
         </div>
         
         <div className="flex flex-col items-center gap-6">
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
               {['Short', 'Detailed', 'Bullets'].map(f => (
                 <button 
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${format === f ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
            <button 
              onClick={handleGenerate}
              className="px-10 py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Sparkles size={20} />
              Generate Summary
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-4xl space-y-10 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
           <h3 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
             <FileText className="text-emerald-500" />
             Structured Summary
           </h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Thematic AI Reconstruction</p>
         </div>
         <div className="flex items-center gap-3">
           <button 
            onClick={handleGenerate}
            disabled={generatingSummary}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/50 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 rounded-xl transition-all disabled:opacity-50"
           >
             <RefreshCw size={14} className={generatingSummary ? 'animate-spin' : ''} /> 
             {generatingSummary ? 'Regenerating...' : 'Regenerate'}
           </button>
         </div>
      </div>
      
      {generatingSummary ? (
        <div className="space-y-8 py-10">
          <div className="space-y-4">
            <div className="h-4 bg-slate-800 animate-pulse rounded-full w-full" />
            <div className="h-4 bg-slate-800 animate-pulse rounded-full w-5/6" />
            <div className="h-4 bg-slate-800 animate-pulse rounded-full w-4/6" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="h-32 bg-slate-800 animate-pulse rounded-3xl" />
             <div className="h-32 bg-slate-800 animate-pulse rounded-3xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="p-10 bg-slate-950/40 border border-slate-800/80 rounded-[40px] shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <BookOpen size={80} className="text-emerald-500" />
            </div>
            <p className="text-slate-300 leading-relaxed font-medium text-base relative z-10">
              {document?.summary?.mainSummary}
            </p>
          </div>

          <div className="space-y-8">
             <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.3em] whitespace-nowrap">Core Takeaways</h4>
                <div className="h-px w-full bg-slate-800" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {document?.summary?.keyPoints?.map((point, i) => (
                  <div key={i} className="p-8 bg-slate-950/20 border border-slate-800/50 rounded-3xl flex items-start gap-5 group hover:border-emerald-500/20 hover:bg-slate-800/20 transition-all shadow-xl">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 text-xs font-bold shadow-inner">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{point}</p>
                  </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TopicsTab = ({ document, setActiveTab, setChatInput }) => {
  const dispatch = useDispatch();
  const { extractingTopics } = useSelector((state) => state.documents);
  const topics = document?.topics || [];
  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleExtract = () => {
    dispatch(extractTopics(document._id));
  };

  const handleExploreInChat = (topic) => {
    setChatInput(`Can you explain "${topic.title}" in detail? Please provide key concepts, examples, and how it relates to the rest of the document.`);
    setActiveTab('chat');
  };

  if (topics.length === 0 && !extractingTopics) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-10 animate-in fade-in zoom-in duration-500">
         <div className="w-20 h-20 bg-teal-500/10 text-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Hash size={40} />
         </div>
         <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Conceptual Mapping</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">Extract core themes, technical concepts, and hierarchical topics from your document.</p>
         </div>
         <button 
           onClick={handleExtract}
           className="px-10 py-4 bg-linear-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
         >
           <Sparkles size={20} />
           Extract Topics
         </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
           <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
             <Hash className="text-teal-500" />
             Core Concepts
           </h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Hierarchical Topic Extraction</p>
         </div>
         <button 
           onClick={handleExtract}
           disabled={extractingTopics}
           className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/50 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-teal-500 hover:border-teal-500/30 rounded-xl transition-all disabled:opacity-50"
         >
           <RefreshCw size={14} className={extractingTopics ? 'animate-spin' : ''} /> 
           {extractingTopics ? 'Extracting...' : 'Re-extract'}
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extractingTopics ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900/40 border border-slate-800/50 rounded-4xl animate-pulse" />)
        ) : (
          topics.map((topic, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedTopic(topic)}
              className="p-8 bg-slate-900/40 border border-slate-800/50 rounded-4xl hover:border-teal-500/40 hover:bg-teal-500/5 hover:-translate-y-2 transition-all duration-300 cursor-pointer group shadow-xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Hash size={60} className="text-teal-500" />
              </div>
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-lg">
                   <Hash size={20} />
                 </div>
                 <span className="px-3 py-1 bg-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest rounded-lg border border-slate-700 group-hover:border-teal-500/30 transition-colors">
                   {topic.category || 'General'}
                 </span>
              </div>
              <h4 className="text-lg font-bold text-slate-200 uppercase tracking-tight group-hover:text-white transition-colors line-clamp-2">{topic.title}</h4>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-3 font-medium">{topic.explanation}</p>
              <div className="flex items-center gap-2 mt-6 text-[9px] font-bold text-teal-500 uppercase tracking-widest group-hover:gap-3 transition-all">
                 <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> Explore in depth
              </div>
            </div>
          ))
        )}
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedTopic(null)}
        >
          <div 
            className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-teal-500/20 rounded-4xl shadow-2xl shadow-teal-500/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-800/60 flex items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-teal-500/10 text-teal-500 rounded-2xl shadow-lg shrink-0">
                  <Hash size={28} />
                </div>
                <div>
                  <span className="px-3 py-1 bg-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest rounded-lg border border-slate-700 inline-block mb-3">
                    {selectedTopic.category || 'General'}
                  </span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">{selectedTopic.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all shrink-0 mt-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Explanation */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.25em]">Overview</p>
                <p className="text-slate-300 leading-relaxed font-medium">{selectedTopic.explanation}</p>
              </div>

              {/* Subtopics if available */}
              {selectedTopic.subtopics && selectedTopic.subtopics.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.25em]">Subtopics</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.subtopics.map((sub, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-800/60 text-slate-300 text-xs font-bold rounded-xl border border-slate-700/50 tracking-tight">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords if available */}
              {selectedTopic.keywords && selectedTopic.keywords.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.25em]">Key Terms</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-teal-500/5 text-teal-400 text-[10px] font-bold rounded-lg border border-teal-500/20 uppercase tracking-wide">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Importance / difficulty if available */}
              {(selectedTopic.importance || selectedTopic.difficulty) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTopic.importance && (
                    <div className="p-5 bg-slate-800/40 border border-slate-700/40 rounded-2xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Importance</p>
                      <p className="text-slate-200 font-bold capitalize">{selectedTopic.importance}</p>
                    </div>
                  )}
                  {selectedTopic.difficulty && (
                    <div className="p-5 bg-slate-800/40 border border-slate-700/40 rounded-2xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Difficulty</p>
                      <p className="text-slate-200 font-bold capitalize">{selectedTopic.difficulty}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-slate-800/60 flex items-center gap-3">
              <button
                onClick={() => handleExploreInChat(selectedTopic)}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-teal-500/20 active:scale-95"
              >
                <MessageSquare size={18} />
                Ask AI about this topic
              </button>
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl font-bold text-sm transition-all border border-slate-700/50 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FlashcardsTab = ({ document }) => {
  const dispatch = useDispatch();
  const { analyzing: generatingCards } = useSelector((state) => state.documents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = document?.flashcards || [];

  const handleGenerate = () => {
    dispatch(analyzeDocument(document._id)); // Reusing analyze for flashcards for now as per current slice
  };

  if (cards.length === 0 && !generatingCards) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-10 animate-in fade-in zoom-in duration-500">
         <div className="w-20 h-20 bg-emerald-400/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Layers size={40} />
         </div>
         <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Active Recall Deck</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">Transform dense content into interactive flashcards for optimized long-term retention.</p>
         </div>
         <button 
           onClick={handleGenerate}
           className="px-10 py-4 bg-linear-to-r from-emerald-400 to-teal-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
         >
           <Sparkles size={20} />
           Create Flashcards
         </button>
      </div>
    );
  }
  if (generatingCards) return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-pulse">
       <div className="w-full h-80 bg-slate-900/40 border-2 border-slate-800/50 rounded-4xl" />
       <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Architecting Flashcards...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
           Concept Mastery
         </div>
         <h3 className="text-3xl font-bold text-white tracking-tight uppercase">Active Recall</h3>
         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{cards.length} AI-generated cards to test your knowledge.</p>
      </div>

      <div 
        className="relative h-[400px] w-full cursor-pointer perspective-2000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
         <div className={`relative w-full h-full transition-all duration-700 transform preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 bg-slate-900/80 border-2 border-slate-800/50 rounded-4xl backface-hidden flex flex-col items-center justify-center p-12 text-center shadow-2xl backdrop-blur-xl group-hover:border-emerald-500/30 transition-colors">
               <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-4xl flex items-center justify-center mb-8 shadow-inner">
                  <Layers size={40} />
               </div>
               <h4 className="text-2xl font-bold text-white leading-tight uppercase tracking-tight">
                 {cards[currentIndex]?.question}
               </h4>
               <p className="text-slate-500 mt-10 text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-3">
                  <span className="w-8 h-px bg-slate-800" />
                  Tap to reveal answer
                  <span className="w-8 h-px bg-slate-800" />
               </p>
            </div>
            
            {/* Back */}
            <div className="absolute inset-0 bg-linear-to-br from-emerald-600 to-teal-700 border-2 border-emerald-400/30 rounded-4xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-12 text-center shadow-2xl">
               <div className="w-20 h-20 bg-white/20 text-white rounded-4xl flex items-center justify-center mb-8 shadow-xl">
                  <CheckCircle2 size={40} />
               </div>
               <p className="text-lg font-bold text-white leading-relaxed">
                 {cards[currentIndex]?.answer}
               </p>
               <div className="mt-10 pt-10 border-t border-white/20 w-full flex justify-center gap-4">
                  <span className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">{cards[currentIndex]?.category}</span>
               </div>
               <p className="absolute bottom-10 text-white/50 text-[10px] uppercase font-bold tracking-widest">Click to flip back</p>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between gap-6">
         <button 
           className="flex-1 py-5 bg-slate-900/50 border border-slate-800/80 text-slate-500 rounded-3xl font-bold text-xs uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all active:scale-95 disabled:opacity-30"
           onClick={(e) => { e.stopPropagation(); setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); }}
           disabled={currentIndex === 0}
         >
           Previous
         </button>
         <div className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
           {String(currentIndex + 1).padStart(2, '0')} <span className="text-emerald-500 mx-2">/</span> {String(cards.length).padStart(2, '0')}
         </div>
         <button 
           className="flex-1 py-5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-3xl font-bold text-xs uppercase tracking-widest hover:from-emerald-400 hover:to-teal-500 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-30"
           onClick={(e) => { e.stopPropagation(); setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); setIsFlipped(false); }}
           disabled={currentIndex === cards.length - 1}
         >
           Next Card
         </button>
      </div>
    </div>
  );
};

const QuizTab = ({ document }) => {
  const dispatch = useDispatch();
  const { analyzing } = useSelector((state) => state.documents);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState('General');
  const [showConfig, setShowConfig] = useState(false);

  const quiz = document?.quiz || [];

  const handleGenerate = async () => {
    await dispatch(generateQuiz({ id: document._id, count, topic })).unwrap();
    setShowConfig(false);
    setCurrentQuestion(0);
    setScore(0);
    setSubmitted(false);
  };

  if ((quiz.length === 0 || showConfig) && !analyzing) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-10 animate-in fade-in zoom-in duration-500">
         <div className="w-20 h-20 bg-emerald-300/10 text-emerald-300 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <HelpCircle size={40} />
         </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Quiz Customization</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Select your parameters for a weighted assessment</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto text-left">
             <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Questions</label>
                <select 
                  value={count} 
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
             </div>
             <div className="flex-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Focus Area</label>
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 text-xs font-bold outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                >
                  <option value="General">Entire Document</option>
                  {document?.topics?.map(t => (
                    <option key={t.title} value={t.title}>{t.title}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleGenerate}
              className="px-10 py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-3xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-95"
            >
              Construct New Quiz
            </button>
            {quiz.length > 0 && (
              <button 
                onClick={() => setShowConfig(false)}
                className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Cancel & Return to Quiz
              </button>
            )}
          </div>
      </div>
    );
  }

  if (analyzing) {
     return (
       <div className="max-w-2xl mx-auto py-32 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-white font-bold uppercase tracking-widest">Synthesizing Assessment...</p>
            <p className="text-slate-500 text-xs uppercase tracking-tight">Large Language Model is processing your request</p>
          </div>
       </div>
     );
  }

  const currentQ = quiz[currentQuestion];

  const handleOptionSelect = (option) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || submitted) return;
    setSubmitted(true);
    if (selectedOption === currentQ.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setCurrentQuestion(currentQuestion + 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-1000">
      <div className="flex justify-end">
         <button 
           onClick={() => setShowConfig(true)}
           className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-500 hover:text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
         >
           Customize Quiz
         </button>
      </div>
      <div className="p-10 bg-slate-900/40 border border-slate-800/50 rounded-4xl space-y-10 shadow-2xl backdrop-blur-xl">
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Challenge {String(currentQuestion + 1).padStart(2, '0')} of {quiz.length}</span>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Current Score: <span className="text-emerald-400">{Math.round((score / quiz.length) * 100)}%</span>
               </div>
            </div>
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-700/20">
               <div className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }} />
            </div>
         </div>

         <h3 className="text-2xl font-bold text-white leading-tight uppercase tracking-tight">
            {currentQ.question}
         </h3>

         <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt, i) => {
              const id = String.fromCharCode(97 + i);
              const isCorrect = submitted && opt === currentQ.correctAnswer;
              const isWrong = submitted && selectedOption === opt && opt !== currentQ.correctAnswer;
              const isSelected = selectedOption === opt;

              return (
                <button 
                  key={i} 
                  onClick={() => handleOptionSelect(opt)}
                  className={`
                    w-full p-5 rounded-3xl flex items-center justify-between group transition-all duration-300 text-left relative overflow-hidden
                    ${isCorrect ? 'bg-emerald-500/10 border-2 border-emerald-500/50 text-white' : ''}
                    ${isWrong ? 'bg-red-500/10 border-2 border-red-500/50 text-white' : ''}
                    ${isSelected && !submitted ? 'bg-slate-800 border-2 border-emerald-500/30 text-white' : ''}
                    ${!isSelected && !isCorrect && !isWrong ? 'bg-slate-950/40 border border-slate-800 text-slate-500 hover:border-emerald-500/30 hover:text-slate-300' : ''}
                  `}
                >
                  <div className="flex items-center gap-5 relative z-10">
                     <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                       {id.toUpperCase()}
                     </span>
                     <span className="font-bold text-sm tracking-tight">{opt}</span>
                  </div>
                  {isCorrect && <CheckCircle2 size={24} className="text-emerald-500 relative z-10" />}
                </button>
              );
            })}
         </div>

         {submitted && (
           <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl animate-in fade-in slide-in-from-top-4">
             <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Academic Reasoning</p>
             <p className="text-sm text-slate-400 leading-relaxed">{currentQ.explanation}</p>
           </div>
         )}

         <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
            <button 
              className="text-slate-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest transition-all"
              onClick={() => { setCurrentQuestion(0); setScore(0); setSubmitted(false); setSelectedOption(null); }}
            >
              Restart Assessment
            </button>
            {submitted && currentQuestion < quiz.length - 1 ? (
              <button 
                onClick={handleNext}
                className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm transition-all shadow-xl active:scale-95"
              >
                Next Question
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={!selectedOption || submitted}
                className="px-10 py-4 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
              >
                Submit Answer
              </button>
            )}
         </div>
      </div>
    </div>
  );
};

const ChatTab = ({ messages, chatInput, setChatInput, handleSendMessage, chatLoading, docTitle }) => (
  <div className="h-[650px] flex flex-col bg-slate-900/40 border border-slate-800/50 rounded-4xl overflow-hidden animate-in slide-in-from-bottom-6 duration-1000 shadow-2xl backdrop-blur-xl">
    {/* Chat History Header */}
    <div className="p-6 border-b border-slate-800/50 bg-bg-main/80 backdrop-blur-md flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <BrainCircuit size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-white uppercase tracking-tight">AI Academic Partner</p>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{docTitle} Active</p>
          </div>
        </div>
      </div>
      <button className="p-3 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-all">
        <Copy size={20} />
      </button>
    </div>

    {/* Messages Area */}
    <div className="grow p-8 overflow-y-auto space-y-8 custom-scrollbar">
      {messages.map((msg, i) => (
        <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse ml-auto max-w-[80%]' : 'max-w-[90%]'}`}>
           <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-md border border-slate-700/30 ${msg.role === 'user' ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white font-bold' : 'bg-slate-800 text-emerald-500'}`}>
             {msg.role === 'user' ? 'U' : <BrainCircuit size={20} />}
           </div>
           <div className={`p-5 shadow-xl backdrop-blur-sm rounded-3xl ${msg.role === 'user' ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-tr-none tracking-tight text-sm leading-relaxed' : 'bg-slate-800/50 border border-slate-700/30 text-slate-300 rounded-tl-none'}`}>
             {msg.role === 'user' ? msg.content : <MarkdownContent content={msg.content} />}
           </div>
        </div>
      ))}
      {chatLoading && (
        <div className="flex gap-5 max-w-[85%]">
          <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0 flex items-center justify-center text-emerald-500 shadow-md border border-slate-700/30">
            <BrainCircuit size={20} className="animate-spin" />
          </div>
          <div className="p-5 bg-slate-800/50 border border-slate-700/30 rounded-3xl rounded-tl-none text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">
            Processing Document Insight...
          </div>
        </div>
      )}
    </div>

    {/* Input Area */}
    <div className="p-4 sm:p-6 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800/80 mt-auto relative z-10">
      <div className="max-w-4xl mx-auto relative group">
        {/* Animated gradient border effect on hover/focus-within */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
        
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-3 bg-[#1e293b]/90 backdrop-blur-md rounded-2xl p-2 pl-5 border border-slate-700/50 shadow-2xl"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask anything about this document..."
            className="w-full bg-transparent border-none text-slate-100 placeholder:text-slate-500 focus:ring-0 px-2 py-3 text-[15px] font-medium"
            disabled={chatLoading}
          />
          
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            className="shrink-0 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn hover:scale-105 active:scale-95"
          >
            {chatLoading ? (
              <BrainCircuit size={20} className="animate-spin" />
            ) : (
              <ArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
            )}
          </button>
        </form>
      </div>
      <div className="text-center mt-3">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
          Nexus AI operates on advanced retrieval models. Verify important output.
        </p>
      </div>
    </div>
  </div>
);

/* --- Markdown Renderer --- */
const MarkdownContent = ({ content }) => (
  <ReactMarkdown
    components={{
      // Headings
      h1: ({ children }) => <h1 className="text-lg font-bold text-white uppercase tracking-tight mt-4 mb-2 first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-bold text-white uppercase tracking-tight mt-4 mb-2 first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide mt-3 mb-1.5 first:mt-0">{children}</h3>,
      h4: ({ children }) => <h4 className="text-sm font-bold text-teal-400 mt-3 mb-1 first:mt-0">{children}</h4>,
      // Paragraph
      p: ({ children }) => <p className="text-sm text-slate-300 leading-relaxed mb-3 last:mb-0">{children}</p>,
      // Bold & Italic
      strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
      em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
      // Unordered List
      ul: ({ children }) => <ul className="space-y-2 my-3 ml-1">{children}</ul>,
      // Ordered List
      ol: ({ children }) => <ol className="space-y-2 my-3 ml-1 list-none counter-reset-[item]">{children}</ol>,
      // List Items
      li: ({ children }) => (
        <li className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span>{children}</span>
        </li>
      ),
      // Horizontal Rule
      hr: () => <hr className="my-4 border-slate-700/50" />,
      // Blockquote
      blockquote: ({ children }) => (
        <blockquote className="my-3 pl-4 border-l-2 border-emerald-500/50 text-slate-400 italic text-sm">
          {children}
        </blockquote>
      ),
      // Inline Code
      code: ({ inline, children }) =>
        inline ? (
          <code className="px-1.5 py-0.5 bg-slate-700/60 text-emerald-400 text-xs font-mono rounded-md border border-slate-600/50">
            {children}
          </code>
        ) : (
          <pre className="my-3 p-4 bg-slate-950/60 border border-slate-700/40 rounded-2xl overflow-x-auto">
            <code className="text-xs font-mono text-emerald-300 leading-relaxed">{children}</code>
          </pre>
        ),
      // Links
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors">
          {children}
        </a>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

export default DocumentDetail;
