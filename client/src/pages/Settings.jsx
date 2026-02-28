import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Bell, Shield, Palette, Database,
  Save, Trash2, LogOut, ChevronRight, Check, Zap
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { clearAll } from '../store/slices/notificationsSlice';
import { selectIsPro, selectDaysRemaining, selectProExpiry } from '../store/slices/planSlice';
import UpgradeModal from '../components/UpgradeModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, description, icon: SectionIcon, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <SectionIcon size={16} className="text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        {description && <p className="text-[11px] text-slate-500">{description}</p>}
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

// ── Toggle row ───────────────────────────────────────────────────────────────
const Toggle = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-slate-200">{label}</p>
      {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${value ? 'bg-emerald-500' : 'bg-slate-700'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

// ── Field row ────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
    />
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const Settings = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);
  const isPro     = useSelector(selectIsPro);
  const daysLeft  = useSelector(selectDaysRemaining);
  const proExpiry = useSelector(selectProExpiry);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Profile state (local only — no backend profile endpoint yet)
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');

  // Notification prefs
  const [notifAnalysis, setNotifAnalysis] = useState(true);
  const [notifSummary,  setNotifSummary]  = useState(true);
  const [notifQuiz,     setNotifQuiz]     = useState(true);

  // Appearance
  const [compactMode,  setCompactMode]  = useState(false);
  const [markdownChat, setMarkdownChat] = useState(true);

  const handleSaveProfile = () => {
    toast.success('Profile preferences saved!');
  };

  const handleClearNotifications = () => {
    dispatch(clearAll());
    toast.success('All notifications cleared.');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <div className="min-h-screen bg-[#0a0f1e] px-4 py-8 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and app preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Profile */}
        <Section icon={User} title="Profile" description="Your account details">
          <Field label="Display Name"    value={name}  onChange={setName}  placeholder="Your name" />
          <Field label="Email Address"   value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Plan</label>
            {isPro ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-400">Pro Plan Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">Expires on</p>
                    <p className="text-slate-200 font-semibold">{proExpiry ? new Date(proExpiry).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Days remaining</p>
                    <p className="text-slate-200 font-semibold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, ((30 - daysLeft) / 30) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">Plan renews monthly · Cancel anytime</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400">Free Plan</span>
                <button onClick={() => setShowUpgrade(true)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                  Upgrade <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save size={15} /> Save Changes
          </button>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" description="Choose which events create alerts">
          <Toggle label="Analysis complete"  description="Notify when full document analysis finishes" value={notifAnalysis} onChange={setNotifAnalysis} />
          <Toggle label="Summary generated"  description="Notify when a summary is ready"              value={notifSummary}  onChange={setNotifSummary} />
          <Toggle label="Quiz generated"     description="Notify when a quiz is generated"             value={notifQuiz}     onChange={setNotifQuiz} />
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" description="Customise the interface">
          <Toggle label="Compact mode"       description="Reduce padding and spacing throughout" value={compactMode}  onChange={setCompactMode} />
          <Toggle label="Markdown in chat"   description="Render AI responses as formatted text" value={markdownChat} onChange={setMarkdownChat} />
        </Section>

        {/* Data */}
        <Section icon={Database} title="Data & Privacy" description="Manage your stored data">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Clear all notifications</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Remove all bell notification history</p>
            </div>
            <button
              onClick={handleClearNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">Sign out</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Log out of your account on this device</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-colors"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>
        </Section>

        {/* Version */}
        <p className="text-center text-[11px] text-slate-600 pb-4">AI Learning Assistant · v1.0.0</p>
      </div>
      </div>
    </>
  );
};

export default Settings;
