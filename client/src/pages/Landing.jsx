import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Zap, 
  FileText, 
  Layers, 
  MessageSquare, 
  ArrowRight,
  BrainCircuit,
  Rocket,
  ShieldCheck,
  ChevronRight,
  Plus,
  Bell
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: "AI Summary",
      description: "Instantly condense complex documents into key insights and executive abstracts.",
      icon: FileText,
      color: "from-emerald-500 to-emerald-700"
    },
    {
      title: "Flashcards & Quiz",
      description: "Master any topic with AI-generated active recall cards and knowledge assessments.",
      icon: Layers,
      color: "from-teal-500 to-teal-700"
    },
    {
      title: "RAG Document Chat",
      description: "Converse directly with your documents. Ask questions and get context-aware answers.",
      icon: MessageSquare,
      color: "from-emerald-400 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-main text-slate-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg-main/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-xl shadow-emerald-500/10 group-hover:scale-110 transition-transform">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">AI Learning <span className="text-emerald-500">Assistant</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Features</a>
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Login</Link>
            <Link to="/register" className="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm tracking-tight hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all">
              Initialize Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[140px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] animate-in fade-in slide-in-from-top-4 duration-700">
            <Rocket size={14} /> The Future of Knowledge Consumption
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Turn Your PDFs Into <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">Smart Learning Systems</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            Generate summaries, flashcards, quizzes, and AI-powered chat instantly. Accelerate your edge with the ultimate academic partner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-emerald-500/25 flex items-center justify-center gap-3 active:scale-95 group">
              Get Started Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3">
              Login to Nexus
            </Link>
          </div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="max-w-7xl mx-auto mt-24 relative animate-in fade-in zoom-in-95 duration-1000 delay-700">
          <div className="p-2 sm:p-4 bg-slate-900/40 border border-slate-800/80 rounded-[32px] sm:rounded-[48px] shadow-2xl backdrop-blur-sm relative">
            <div className="aspect-[4/5] sm:aspect-square md:aspect-video bg-[#0a0f1e] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-slate-800 flex relative group">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5" />
                
                {/* Simulated UI Mockup */}
                <div className="absolute inset-0 p-3 sm:p-6 flex gap-3 sm:gap-6">
                  {/* Left Sidebar Mockup */}
                  <div className="hidden lg:flex w-1/4 h-full bg-slate-900/60 rounded-2xl border border-slate-800/60 p-5 flex-col gap-6 relative overflow-hidden backdrop-blur-md">
                     <div className="w-full h-10 bg-slate-800/40 rounded-xl flex items-center px-4 gap-2 text-slate-400">
                        <Plus size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">New</span>
                     </div>
                     <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Recent Context</p>
                       {[
                         { icon: FileText, name: "Neural_Net_Design.pdf" },
                         { icon: MessageSquare, name: "Quantum Computing Basics" },
                         { icon: FileText, name: "Q1_Financial_Report.pdf" },
                         { icon: Layers, name: "Biology Midterm Quiz" }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-default">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                              <item.icon size={14} />
                           </div>
                           <div className="flex-1 truncate">
                             <p className={`text-xs font-medium truncate ${i === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{item.name}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="mt-auto w-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden group">
                       <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-500/30 transition-colors" />
                       <div className="flex items-center gap-2 mb-2">
                         <Zap size={14} className="text-emerald-400" />
                         <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pro Active</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                         <div className="w-2/3 h-full bg-emerald-400 rounded-full" />
                       </div>
                       <p className="text-[10px] text-slate-400 mt-2">12 days remaining</p>
                     </div>
                  </div>
                  
                  {/* Main Content Mockup */}
                  <div className="flex-1 h-full flex flex-col gap-3 sm:gap-6 min-w-0">
                     {/* Top Bar */}
                     <div className="w-full h-12 sm:h-16 bg-slate-900/60 rounded-2xl border border-slate-800/60 flex items-center justify-between px-3 sm:px-6 backdrop-blur-md">
                       <div className="flex items-center gap-2 truncate">
                         <FileText size={16} className="text-slate-400 shrink-0" />
                         <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">Neural_Net_Design.pdf</span>
                         <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-md ml-2 border border-emerald-500/20">Analyzed</span>
                       </div>
                       <div className="flex gap-2 sm:gap-4 items-center shrink-0">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center">
                           <Bell size={12} className="text-slate-400" />
                         </div>
                         <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-linear-to-br from-emerald-500/50 to-teal-600/50 border border-emerald-400/30 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white">
                           US
                         </div>
                       </div>
                     </div>
                     
                     {/* Content Viewer + AI Chat */}
                     <div className="flex-1 w-full flex gap-3 sm:gap-6 z-10 min-h-0">
                       <div className="flex-2 h-full bg-slate-900/60 rounded-2xl border border-slate-800/60 p-4 sm:p-6 flex flex-col backdrop-blur-md relative overflow-hidden min-w-0">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                         
                         <h3 className="text-sm sm:text-lg font-bold text-white mb-3 sm:mb-6 truncate">4.2 Backpropagation Algorithm</h3>
                         
                         {/* Text lines */}
                         <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-8 text-slate-400 text-xs sm:text-sm leading-relaxed overflow-y-auto custom-scrollbar flex-1 pr-1 sm:pr-2">
                           <p>The backpropagation algorithm calculates the gradient of the error function with respect to the neural network's weights.</p>
                           <p className="opacity-70">It does this by propagating the error backward through the network, from the output layer to the hidden layers.</p>
                           <div className="p-2 sm:p-4 bg-slate-950/50 border border-slate-800 rounded-lg font-mono text-[8px] sm:text-xs text-emerald-300 my-2 sm:my-4 overflow-x-auto whitespace-nowrap">
                             δ_j^l = \sum_k w_{'{'}jk{'}'}^{'{'}l+1{'}'} δ_k^{'{'}l+1{'}'} f'(z_j^l)
                           </div>
                           <p className="opacity-50 hidden sm:block">This recursive formula allows for efficient computation of gradients for all weights in the network.</p>
                         </div>

                         {/* Action Cards */}
                         <div className="flex gap-2 sm:gap-4 mt-auto">
                           {[
                             { icon: FileText, title: "Summary", desktopTitle: "Executive Summary", desc: "1 page overview" },
                             { icon: Layers, title: "Flashcards", desktopTitle: "Generate Flashcards", desc: "15 cards ready" },
                             { icon: BrainCircuit, title: "Quiz", desktopTitle: "Take Quiz", desc: "Test knowledge" }
                           ].map((item, i) => (
                             <div key={i} className="flex-1 min-w-0 bg-linear-to-br from-slate-800/30 to-slate-800/10 rounded-xl border border-slate-700/30 p-2 sm:p-4 flex flex-col items-center sm:items-start group hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer">
                               <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-1 sm:mb-3 group-hover:scale-110 transition-transform shrink-0">
                                  <item.icon className="text-emerald-400 w-3 h-3 sm:w-4 sm:h-4" />
                               </div>
                               <p className="text-[9px] sm:text-xs font-bold text-white mb-0.5 sm:mb-1 group-hover:text-emerald-300 transition-colors w-full text-center sm:text-left truncate">
                                 <span className="sm:hidden">{item.title}</span>
                                 <span className="hidden sm:inline">{item.desktopTitle}</span>
                               </p>
                               <p className="text-[8px] sm:text-[10px] text-slate-500 truncate w-full hidden sm:block">{item.desc}</p>
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       {/* AI Side Panel */}
                       <div className="hidden md:flex flex-1 h-full bg-slate-900/80 rounded-2xl border border-slate-800/80 flex-col p-5 relative overflow-hidden backdrop-blur-xl min-w-0">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                             <Zap size={14} className="text-emerald-400 fill-emerald-400" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-slate-200">AI Assistant</p>
                             <p className="text-[10px] text-emerald-400">Online & Ready</p>
                           </div>
                         </div>
                         
                         <div className="flex-1 flex flex-col justify-end space-y-5 mb-4 overflow-hidden">
                           {/* User Bubble */}
                           <div className="w-5/6 bg-slate-800 rounded-2xl rounded-tr-sm p-3 ml-auto text-xs text-slate-200 shadow-md">
                             Explain the formula shown in section 4.2 in simple terms.
                           </div>
                           {/* AI Bubble */}
                           <div className="w-11/12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm p-4 relative shadow-lg">
                             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl" />
                             <p className="text-xs text-slate-300 leading-relaxed">
                               Think of it like a team trying to hit a target. If they miss, the <span className="text-emerald-400 font-semibold">error</span> is sent back from the final person (output) through the chain of command (hidden layers). Each person adjusts their aim (<span className="text-emerald-400 font-semibold">weights</span>) based on how much they contributed to the miss.
                             </p>
                           </div>
                         </div>
                         
                         {/* Input */}
                         <div className="w-full bg-slate-950/80 rounded-xl border border-slate-700/80 p-3 flex flex-col gap-2">
                            <span className="text-xs text-slate-500">Ask a follow-up question...</span>
                            <div className="flex justify-between items-center mt-2">
                               <div className="flex gap-2">
                                 <Plus size={14} className="text-slate-500" />
                               </div>
                               <div className="p-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer">
                                 <ArrowRight size={14} className="text-white" />
                               </div>
                            </div>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
             <h2 className="text-4xl font-bold text-white tracking-tight uppercase">Infinite Capabilities</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Architecting the perfect learning environment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-10 bg-slate-900/40 border border-slate-800/50 rounded-4xl hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-2 shadow-2xl relative overflow-hidden">
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-linear-to-br ${feature.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
                <div className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-10 shadow-xl`}>
                   <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-10">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all">
                  Analyze Module <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <span className="font-bold tracking-tight uppercase">AI Learning <span className="text-emerald-500">Assistant</span></span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest leading-loose text-center md:text-left">
            Built for the modern edge. <br /> © 2026 AI LEARNING ASSISTANT
          </p>
          <div className="flex items-center gap-8">
             <Link to="/privacy" className="text-slate-500 hover:text-emerald-500 transition-colors uppercase font-bold text-[10px] tracking-widest">Privacy</Link>
             <Link to="/security" className="text-slate-500 hover:text-emerald-500 transition-colors uppercase font-bold text-[10px] tracking-widest">Security</Link>
             <Link to="/status" className="text-slate-500 hover:text-emerald-500 transition-colors uppercase font-bold text-[10px] tracking-widest">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
