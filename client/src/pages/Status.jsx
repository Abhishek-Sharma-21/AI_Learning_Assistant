import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, ArrowLeft, Zap } from 'lucide-react';

const Status = () => {
  // Mock data for system status
  const services = [
    { name: 'Authentication API',  status: 'operational', uptime: '99.99%',  latency: '45ms' },
    { name: 'Document Processor',  status: 'operational', uptime: '99.95%',  latency: '1.2s' },
    { name: 'AI Inference Engine', status: 'operational', uptime: '99.98%',  latency: '850ms' },
    { name: 'Vector Database',     status: 'operational', uptime: '100.00%', latency: '12ms' },
  ];

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
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">System Status</h1>
            <p className="text-slate-400 max-w-xl">Real-time status of AI Learning Assistant systems and services.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <span className="text-sm font-bold text-emerald-400">All Systems Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
             <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Global Uptime</p>
             <p className="text-3xl font-bold text-white">99.98%</p>
           </div>
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
             <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Active Incidents</p>
             <p className="text-3xl font-bold text-white">0</p>
           </div>
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
             <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Avg AI Latency</p>
             <p className="text-3xl font-bold text-white">850ms</p>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
            <Activity size={18} className="text-slate-400" />
            <h3 className="font-bold text-white">Service Health</h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {services.map((service, i) => (
              <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                 <div>
                   <p className="font-bold text-slate-200">{service.name}</p>
                   <div className="flex items-center gap-4 mt-1">
                     <span className="text-xs text-slate-500">Uptime: {service.uptime}</span>
                     <span className="text-xs text-slate-500">Latency: {service.latency}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-emerald-400" />
                   <span className="text-sm font-bold text-emerald-400 capitalize">{service.status}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Status;
