import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import {
  X, Zap, Check, Lock, CreditCard, Calendar,
  ShieldCheck, Loader2, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { upgradeToPro } from '../store/slices/planSlice';
import toast from 'react-hot-toast';

const genTxnId = () => `TXN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

// ── Constants ─────────────────────────────────────────────────────────────────
const PRO_FEATURES = [
  'Unlimited PDF uploads',
  'Unlimited AI chat messages',
  'Priority document analysis',
  'Advanced quiz & flashcard generation',
  'Custom quiz topics & question count',
  'PDF study notes download',
  'Early access to new features',
];

const FREE_FEATURES = [
  '2 PDF uploads',
  '10 AI chat messages per session',
  'Basic document analysis',
  'Standard quiz & flashcards',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtCard   = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

// ── Shared PaymentField (defined at module level to satisfy React lint rules) ─
const PaymentField = ({ label, id, value, onChange, placeholder, maxLen, error, type = 'text', icon: Icon }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
    <div className={`flex items-center gap-2 bg-slate-800 border ${error ? 'border-red-500/60' : 'border-slate-700'} rounded-xl px-3 py-2.5 focus-within:border-emerald-500 transition-colors`}>
      {Icon && <Icon size={14} className="text-slate-500 shrink-0" />}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLen}
        className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
      />
    </div>
    {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
  </div>
);

// ── Step 1 — Plan overview ────────────────────────────────────────────────────
const PlanStep = ({ onNext, onClose, reason }) => (
  <>
    <div className="px-8 pt-8 pb-6 text-center border-b border-slate-800">
      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
        <Zap size={24} className="text-white fill-white" />
      </div>
      <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
      {reason && (
        <p className="text-sm text-amber-400 mt-2 flex items-center justify-center gap-1.5">
          <Lock size={13} /> {reason}
        </p>
      )}
      <p className="text-slate-400 text-xs mt-1">Remove all limits and unlock the full experience</p>
    </div>

    <div className="px-8 py-6 grid grid-cols-2 gap-4">
      {/* Free */}
      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Free</p>
        <ul className="space-y-2">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[11px] text-slate-500">
              <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center">
                <Check size={8} className="text-slate-400" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Pro */}
      <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/25 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full" />
        <div className="flex items-center gap-1.5 mb-3">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pro</p>
          <span className="px-1.5 py-0.5 bg-emerald-500 rounded text-[9px] font-bold text-white">✦ BEST</span>
        </div>
        <ul className="space-y-2">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[11px] text-slate-300">
              <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Check size={8} className="text-emerald-400" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="px-8 pb-8 space-y-3">
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-3xl font-black text-white">₹299</span>
        <div className="text-left">
          <p className="text-xs text-slate-400">per month</p>
          <p className="text-[10px] text-slate-500">Billed monthly · Cancel anytime</p>
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full py-3.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <CreditCard size={16} /> Continue to Payment
      </button>
      <button onClick={onClose} className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-xs transition-colors">
        Continue with Free plan
      </button>
    </div>
  </>
);

// ── Step 2 — Card form ────────────────────────────────────────────────────────
const PaymentStep = ({ onBack, onPay }) => {
  const [card,   setCard]   = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv,    setCvv]    = useState('');
  const [name,   setName]   = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (card.replace(/\s/g, '').length < 16) e.card   = 'Enter a valid 16-digit card number';
    if (expiry.length < 5)                   e.expiry = 'Enter a valid expiry (MM/YY)';
    if (cvv.length < 3)                      e.cvv    = 'Enter a valid CVV';
    if (!name.trim())                        e.name   = 'Enter the cardholder name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onPay(); };

  return (
    <>
      <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-sm font-bold text-white">Payment Details</p>
          <p className="text-[10px] text-slate-500">Dummy gateway — no real charges</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-emerald-400">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-semibold">Secure</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          {['VISA', 'MC', 'AMEX', 'RuPay'].map((b) => (
            <span key={b} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-400">{b}</span>
          ))}
          <span className="ml-auto text-[10px] text-slate-600">Test: 4111 1111 1111 1111</span>
        </div>

        <PaymentField
          label="Card Number" id="card"
          value={card} onChange={(e) => setCard(fmtCard(e.target.value))}
          placeholder="4111 1111 1111 1111" maxLen={19} error={errors.card}
          icon={CreditCard}
        />
        <div className="grid grid-cols-2 gap-3">
          <PaymentField
            label="Expiry" id="expiry"
            value={expiry} onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
            placeholder="MM/YY" maxLen={5} error={errors.expiry}
            icon={Calendar}
          />
          <PaymentField
            label="CVV" id="cvv"
            value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••" maxLen={4} error={errors.cvv} type="password"
            icon={Lock}
          />
        </div>
        <PaymentField
          label="Cardholder Name" id="name"
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Name on card" error={errors.name}
        />

        {/* Order summary */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-400"><span>AI Learning Assistant Pro</span><span>₹299/mo</span></div>
          <div className="flex justify-between text-slate-400"><span>GST (18%)</span><span>₹53.82</span></div>
          <div className="border-t border-slate-700 pt-1.5 mt-1.5 flex justify-between font-bold text-white"><span>Due today</span><span>₹352.82</span></div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ShieldCheck size={15} /> Pay ₹352.82
        </button>
        <p className="text-center text-[10px] text-slate-600">Dummy gateway · No real charges made</p>
      </form>
    </>
  );
};

// ── Step 3 — Processing ───────────────────────────────────────────────────────
const ProcessingStep = () => (
  <div className="flex flex-col items-center justify-center gap-5 px-8 py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
      <Loader2 size={28} className="text-emerald-400 animate-spin" />
    </div>
    <div>
      <p className="text-white font-bold text-lg">Processing Payment…</p>
      <p className="text-slate-400 text-sm mt-1">Verifying with payment gateway</p>
    </div>
    <div className="flex gap-3 mt-2">
      {['Authenticating', 'Verifying', 'Activating'].map((s, i) => (
        <span key={s} className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          {s}
        </span>
      ))}
    </div>
  </div>
);

// ── Step 4 — Success ──────────────────────────────────────────────────────────
const SuccessStep = ({ onClose, txnId }) => (
  <div className="flex flex-col items-center justify-center gap-5 px-8 py-14 text-center">
    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
      <CheckCircle2 size={40} className="text-emerald-400" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">Payment Successful! 🎉</p>
      <p className="text-slate-400 text-sm mt-2">You're now on Pro. All limits removed.</p>
    </div>
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 w-full text-left space-y-2">
      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Order Summary</p>
      <div className="flex justify-between text-xs text-slate-300"><span>Plan</span><span className="font-bold text-white">Pro Monthly</span></div>
      <div className="flex justify-between text-xs text-slate-300"><span>Amount paid</span><span className="font-bold text-white">₹352.82</span></div>
      <div className="flex justify-between text-xs text-slate-300"><span>Transaction ID</span><span className="font-mono text-[10px] text-slate-500">{txnId}</span></div>
    </div>
    <button
      onClick={onClose}
      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all"
    >
      Start Using Pro →
    </button>
  </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const UpgradeModal = ({ onClose, reason }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState('plan');
  const [txnId] = useState(genTxnId);

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      dispatch(upgradeToPro());
      toast.success('🎉 Payment successful! Welcome to Pro.');
      setStep('success');
    }, 2500);
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      onClick={step !== 'processing' ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        {step !== 'processing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors z-10"
          >
            <X size={18} />
          </button>
        )}

        {step === 'plan'       && <PlanStep       onNext={() => setStep('payment')} onClose={onClose} reason={reason} />}
        {step === 'payment'    && <PaymentStep    onBack={() => setStep('plan')}    onPay={handlePay} />}
        {step === 'processing' && <ProcessingStep />}
        {step === 'success'    && <SuccessStep    onClose={onClose} txnId={txnId} />}
      </div>
    </div>,
    document.body
  );
};

export default UpgradeModal;
