import { createSlice } from '@reduxjs/toolkit';

// ── Persist helpers ────────────────────────────────────────────────────────────
const stored       = localStorage.getItem('userPlan');
const storedExpiry = localStorage.getItem('proExpiry');

// Auto-expire: if stored expiry has passed, treat as free
const isStillPro = stored === 'pro' && storedExpiry && new Date(storedExpiry) > new Date();

const planSlice = createSlice({
  name: 'plan',
  initialState: {
    plan:       isStillPro ? 'pro'        : 'free',
    proExpiry:  isStillPro ? storedExpiry : null,   // ISO string or null
  },
  reducers: {
    upgradeToPro: (state) => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);        // 30-day plan
      const expiryISO = expiry.toISOString();
      state.plan      = 'pro';
      state.proExpiry = expiryISO;
      localStorage.setItem('userPlan',   'pro');
      localStorage.setItem('proExpiry',  expiryISO);
    },
    downgradeToFree: (state) => {
      state.plan      = 'free';
      state.proExpiry = null;
      localStorage.setItem('userPlan', 'free');
      localStorage.removeItem('proExpiry');
    },
  },
});

export const { upgradeToPro, downgradeToFree } = planSlice.actions;
export default planSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectIsPro      = (state) => state.plan.plan === 'pro';
export const selectIsFree     = (state) => state.plan.plan === 'free';
export const selectProExpiry  = (state) => state.plan.proExpiry;

/** Returns days remaining (rounded down), or null if not pro */
export const selectDaysRemaining = (state) => {
  if (state.plan.plan !== 'pro' || !state.plan.proExpiry) return null;
  const ms = new Date(state.plan.proExpiry) - new Date();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

// ── Free-plan limits ───────────────────────────────────────────────────────────
export const FREE_UPLOAD_LIMIT = 2;
export const FREE_CHAT_LIMIT   = 10;
