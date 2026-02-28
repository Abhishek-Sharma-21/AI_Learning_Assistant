import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, ArrowLeft, Zap } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 font-sans">
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-linear-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
               <Zap className="text-white fill-white" size={16} />
             </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-6">
            <FileText size={12} /> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: March 1, 2026</p>
        </div>

        <div className="space-y-12 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="text-emerald-400" /> Information We Collect
            </h2>
            <p className="mb-4">
              At AI Learning Assistant, we take your privacy seriously. We only collect the information necessary to provide you with the best learning experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
              <li><strong>Uploaded Content:</strong> PDF documents you choose to upload for analysis.</li>
              <li><strong>Interaction Data:</strong> Chat logs with the AI, generated quizzes, and flashcards.</li>
              <li><strong>Usage Metrics:</strong> Telemetry data on how you interact with the dashboard.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock className="text-teal-400" /> How We Use Your Data
            </h2>
            <p className="mb-4">
               Your documents are processed temporarily in memory to generate context for the AI model. We do not use your personal documents to train our base AI models.
            </p>
            <p>
              Data is used strictly to provide the service: summarizing your files, generating flashcards, and facilitating the RAG (Retrieval-Augmented Generation) chat.
            </p>
          </section>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
             <h3 className="font-bold text-white mb-2">Data Deletion</h3>
             <p className="text-sm text-slate-400">
               When you delete a document from your library, it is permanently erased from our databases and vector stores. You can request a full account purge at any time via the Settings page.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
