import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      dispatch(loginFailure('Identity details required for nexus entry'));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(loginFailure('Identity keys do not match'));
      return;
    }
    
    dispatch(clearError());
    dispatch(loginStart());
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Identity deployed. Welcome to the Nexus.');
      dispatch(loginSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex font-sans text-slate-100 overflow-hidden">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex w-1/2 bg-surface relative overflow-hidden items-center justify-center p-20 border-r border-slate-800/50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-emerald-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 scale-150 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-teal-500/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 scale-125" />
        </div>
        
        <div className="relative z-10 space-y-12 max-w-lg">
          <Link to="/" className="flex items-center gap-4 group mb-12">
            <div className="w-14 h-14 bg-linear-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Zap className="text-white fill-white" size={32} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">AI Learning</h1>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] leading-none">Assistant Core</p>
            </div>
          </Link>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold tracking-tight leading-[1.1]">
              Join the <br />
              <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">Cognitive Nexus</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Create your identity and unlock the full potential of AI-assisted learning. Standardize your research, optimize your study flow, and master knowledge at scale.
            </p>
          </div>

          <div className="space-y-4 pt-6">
             {[
               "Context-Aware Document Analysis",
               "Automated Spaced Repetition",
               "Real-time Knowledge Synthesis",
               "Secure Data Encryption"
             ].map(item => (
                <div key={item} className="flex items-center gap-3">
                   <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="text-emerald-500" size={12} />
                   </div>
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">{item}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        <div className="lg:hidden absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-white tracking-tight uppercase">Initialize ID</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Establish your presence in the learning network</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-10 rounded-4xl shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-tight animate-in shake">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Full Signature</label>
                  <div className="relative group/input">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium text-sm"
                      placeholder="Alexander Nexus"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Email Identity</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium text-sm"
                      placeholder="name@nexus.ai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Key</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Key</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-emerald-500 transition-colors" size={18} />
                      <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group/btn overflow-hidden relative"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-white" size={24} />
                ) : (
                  <>
                    <span className="relative z-10">Deploy Identity</span>
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover/btn:h-full bg-white/10 transition-all duration-300 pointer-events-none" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-800/50 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Already have an ID?</span>{' '}
              <Link to="/login" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors ml-2 underline underline-offset-4 decoration-emerald-500/20 hover:decoration-emerald-500/50">Resume Access</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
