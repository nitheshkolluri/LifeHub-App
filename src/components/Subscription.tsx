import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { Check, Star, Zap, Shield, X, Loader2, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { getEnv } from '../utils/env';
import { apiService } from '../services/api.service';

interface SubscriptionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isOnboarding?: boolean;
}

export const SubscriptionModal = ({ isOpen, onClose, isOnboarding = false }: SubscriptionModalProps) => {
  const { user } = useAuth();
  const { setShowUpsell } = useApp();
  const { setShowPaywall } = useUsage();
  const [loading, setLoading] = useState(false);

  // If not explicitly controlled, assume it's handling the global Upsell state
  const handleClose = () => {
    if (onClose) onClose();
    else {
      setShowUpsell(false);
      setShowPaywall(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const priceId = getEnv('VITE_STRIPE_PRICE_ID_PRO_MONTHLY');

      if (!priceId) {
        alert(`Configuration Error: Price ID is missing.\n\nPlease check your Cloud Run FRONTEND variables.`);
        return;
      }

      // Get current URL for redirect
      const origin = window.location.origin;
      const successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/`;

      const { data } = await apiService.subscription.createCheckoutSession(priceId, successUrl, cancelUrl);

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to checkout", error);
      alert("Checkout initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If being used as a controlled component (isOpen is passed)
  if (isOpen === false) return null;

  return (
    <div className="relative w-full max-w-5xl bg-white shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh]">

      {/* Left Side: Brand Narrative (Fortune 500 Style: Minimal, photographic feel) */}
      <div className="bg-black w-full md:w-1/2 p-12 relative overflow-hidden flex flex-col justify-between text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black opacity-90" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 opacity-60">
            <Crown size={20} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">LifeHub Premium</span>
          </div>

          <h2 className="text-5xl font-light tracking-tight leading-tight">
            Mastery <br />
            <span className="font-bold">By Design.</span>
          </h2>

          <p className="text-slate-400 font-light text-lg leading-relaxed max-w-sm">
            For those who demand precision. The ultimate suite for financial, habit, and task orchestration.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 mt-12 border-t border-white/10 pt-8">
          <div>
            <p className="text-3xl font-light">∞ <span className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Limitless</span></p>
            <p className="text-xs text-slate-500 mt-1">Data Storage</p>
          </div>
          <div>
            <p className="text-3xl font-light">A.I. <span className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Native</span></p>
            <p className="text-xs text-slate-500 mt-1">Neural Integration</p>
          </div>
        </div>
      </div>

      {/* Right Side: Tiers (Clean, Corporate) */}
      <div className="flex-1 p-12 bg-white flex flex-col justify-center relative">
        <button
          onClick={handleClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-black transition-colors"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest mb-1">Select Tier</h3>
            <p className="text-slate-400 font-light">Choose your level of engagement.</p>
          </div>

          {/* Tiers */}
          <div className="space-y-4">
            {/* Monthly */}
            <div className="group border border-slate-200 p-6 flex items-center justify-between cursor-pointer hover:border-black transition-all">
              <div>
                <p className="font-bold text-lg text-slate-900">Standard</p>
                <p className="text-slate-400 text-sm">Monthly billing</p>
              </div>
              <div className="text-right">
                <p className="font-light text-2xl text-slate-900">$3.99</p>
              </div>
            </div>

            {/* Annual */}
            {/* Highlighted Tier */}
            <div className="group border-2 border-black bg-slate-50 p-6 flex items-center justify-between cursor-pointer relative overflow-hidden" onClick={handleUpgrade}>
              <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                Preferred
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900">Executive</p>
                <p className="text-slate-500 text-sm">Annual billing (Save 20%)</p>
              </div>
              <div className="text-right">
                <p className="font-light text-2xl text-slate-900">$39.99</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-black hover:bg-slate-800 text-white py-5 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Begin Subscription'}
            <ArrowRight size={16} />
          </button>

          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
            Cancel anytime via Profile • Secure Stripe Processing
          </p>
        </div>
      </div>
    </div>
    </div >
  );
};
