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

  const handleUpgrade = () => {
    setLoading(true);
    try {
      // 1. Get Payment Link from Env
      const paymentLink = getEnv('VITE_STRIPE_PAYMENT_LINK');

      if (!paymentLink) {
        alert("Configuration Error: Payment Link missing.\n\nPlease add VITE_STRIPE_PAYMENT_LINK to your .env file.");
        setLoading(false);
        return;
      }

      // 2. Redirect
      window.location.href = paymentLink;

    } catch (error) {
      console.error("Redirect failed", error);
      setLoading(false);
    }
  };

  // If being used as a controlled component (isOpen is passed)
  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl animate-scale-in border border-white/50">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <Crown className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Unlock Limitless</h2>
          <p className="text-slate-500 font-medium">Elevate your operating system.</p>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          {[
            { icon: Zap, text: "Unlimited AI Access" },
            { icon: Shield, text: "Secure Cloud Vault" },
            { icon: Star, text: "Infinite Habits & Tasks" },
            { icon: Sparkles, text: "Premium Themes" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                <feature.icon size={14} />
              </div>
              <span className="font-bold text-slate-700">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <span className="text-4xl font-black text-slate-900">$3.99</span>
          <span className="text-slate-400 font-bold uppercase text-xs ml-1">/ month</span>
          <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-2">Launch Offer • Cancel Anytime</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-[24px] font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Upgrade Now'}
            {!loading && <ArrowRight size={20} />}
          </button>

          <button
            onClick={handleClose}
            className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Close X (Absolute) */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={24} />
        </button>

      </div>
    </div>
  );
};
