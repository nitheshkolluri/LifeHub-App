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
      const publishableKey = getEnv('VITE_STRIPE_PUBLISHABLE_KEY');

      if (!priceId || !publishableKey) {
        alert(`Configuration Error: Missing Stripe Keys.\n\nPlease check your .env file.`);
        return;
      }

      // Dynamic Import for performance
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(publishableKey);

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Cast to any to avoid TS issues with dynamic import types
      const { error } = await (stripe as any).redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/`,
      });

      if (error) {
        console.error("Stripe Error:", error);
        alert(`Payment Error: ${error.message}`);
      }

    } catch (error: any) {
      console.error("Failed to checkout", error);
      alert(`Checkout initialization failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // If being used as a controlled component (isOpen is passed)
  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
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

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest mb-1">Account Tier</h3>
                <p className="text-slate-400 font-light">Current vs Potential</p>
              </div>

              {/* Comparison Table */}
              <div className="grid grid-cols-2 gap-4">
                {/* Free Tier */}
                <div className="border border-slate-200 p-4 opacity-50">
                  <p className="font-bold text-sm text-slate-900 mb-2">Basic (Free)</p>
                  <ul className="space-y-2 text-[10px] text-slate-500 uppercase tracking-widest">
                    <li>• 500MB Storage</li>
                    <li>• 15 Daily Tokens</li>
                    <li>• 10 active Tasks</li>
                  </ul>
                </div>

                {/* Pro Tier */}
                <div className="border-2 border-black p-4 bg-slate-50 relative">
                  <div className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">Selected</div>
                  <p className="font-bold text-sm text-slate-900 mb-2">Executive (Pro)</p>
                  <ul className="space-y-2 text-[10px] text-slate-900 font-bold uppercase tracking-widest">
                    <li>• ∞ Unlimited Storage</li>
                    <li>• ∞ Neural Access (AI)</li>
                    <li>• ∞ No Limits</li>
                    <li>• Financial Vault</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900">$3.99</span>
                  <span className="text-slate-500 font-medium text-xs ml-1">/ month</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 line-through">$9.99</p>
                  <p className="text-[10px] text-rose-500 font-bold uppercase">Launch Price</p>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-black hover:bg-slate-800 text-white py-5 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Upgrade to Executive'}
                <ArrowRight size={16} />
              </button>

              <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
                Cancel anytime via Profile • Secure Stripe Processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
