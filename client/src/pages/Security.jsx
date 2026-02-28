import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Server, Key, ArrowLeft, Zap } from 'lucide-react';

const Security = () => {
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

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
             <ShieldCheck size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Enterprise-Grade Security</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Your intellectual property and academic materials are protected by state-of-the-art security protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6">
               <Key className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Encryption at Rest & Transit</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              All data transmitted between your browser and our servers is secured using TLS 1.3 encryption. Your stored documents and vector embeddings are encrypted at rest using AES-256 standard.
            </p>
          </div>

          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6">
               <Server className="text-teal-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Isolated Vector Stores</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When processing your PDFs for the RAG chat, the generated vector embeddings are strictly isolated by Tenant ID. It is cryptographically impossible for another user to retrieve context from your documents.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;
