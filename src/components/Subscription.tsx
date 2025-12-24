import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { Check, X, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { getEnv } from '../utils/env';
import { Logo } from './Logo';

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
      const paymentLink = getEnv('VITE_STRIPE_PAYMENT_LINK');
      if (!paymentLink) {
        alert("Payment Link Config missing. Please check .env");
        setLoading(false);
        return;
      }
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Redirect failed", error);
      setLoading(false);
    }
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden animate-scale-in flex flex-col md:flex-row h-auto min-h-[500px] border border-zinc-200">

        {/* LEFT PANEL: Branding (Linear/Vercel Style) */}
        <div className="bg-zinc-50 w-full md:w-[40%] p-8 relative flex flex-col justify-between border-r border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-8 opacity-90">
              <Logo size={28} />
              <span className="text-xl font-bold tracking-tight text-zinc-900">LifeHub</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                Upgrade to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">Executive</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                The complete operating system for high-performance living. Unlimited vaults, AI architecture, and precision analytics.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-xs font-medium text-zinc-600">
              <ShieldCheck size={16} className="text-zinc-900" />
              <span>Secure Stripe Checkout</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-zinc-600">
              <Zap size={16} className="text-zinc-900" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Pricing */}
        <div className="flex-1 p-8 md:p-10 bg-white relative flex flex-col justify-center">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="max-w-sm mx-auto w-full">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">$3.99</span>
              <span className="text-zinc-500 font-medium">/month</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mb-8">Billed monthly. 7-day free trial included.</p>

            <ul className="space-y-3 mb-8">
              {[
                "AI Strategy Architect",
                "Unlimited Financial Vaults",
                "Advanced Habit Analytics",
                "Device Sync & Backup"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <Check size={16} className="text-zinc-900 stroke-[3px]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Start 7-Day Free Trial'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>

            <button
              onClick={handleClose}
              className="w-full mt-4 text-center text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
            >
              Continue with Basic Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
