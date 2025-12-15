import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { Check, Star, Zap, Shield, X, Loader2, Crown, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh]">

        {/* Left Side: Visual / Value Prop */}
        <div className="bg-slate-900 w-full md:w-2/5 p-8 relative overflow-hidden flex flex-col justify-between text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90" />
          <div className="absolute top-[-50%] left-[-50%] w-[150%] h-[150%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

          {/* Animated Orbs */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-rose-500 rounded-full blur-[60px] opacity-40 animate-pulse" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-indigo-400 rounded-full blur-[60px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                <Crown size={24} className="text-amber-300" />
              </div>
              <span className="font-bold tracking-widest uppercase text-xs opacity-80">LifeHub Premium</span>
            </div>

            <h2 className="text-4xl font-black tracking-tight leading-tight mb-4">
              Unlock your<br />full potential.
            </h2>
            <p className="text-indigo-100 font-medium leading-relaxed opacity-90">
              Experience clarity and focus without limits. Join elite performers organizing their life with AI.
            </p>
          </div>

          <div className="relative z-10 mt-8 space-y-4">
            {/* Testimonial or Trust */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-slate-200" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-indigo-500 text-[10px] flex items-center justify-center font-bold">
                +1k
              </div>
            </div>
            <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Trusted by 1,000+ Users</p>
          </div>
        </div>

        {/* Right Side: Features & Pricing */}
        <div className="flex-1 p-8 md:p-10 bg-white relative">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-20"
          >
            <X size={24} />
          </button>

          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">
                {isOnboarding ? 'Start your 7-Day Free Trial' : 'Upgrade to Pro'}
              </h3>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-max">
                <Sparkles size={14} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-wide">7 Days Free Trial Included</span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: "Unlimited AI Brain Dumps", desc: "No limits on voice or text processing." },
                { title: "Financial Freedom", desc: "Track unlimited expenses and budgets." },
                { title: "Advanced Analytics", desc: "Weekly rhythm reports and insights." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{feature.title}</h4>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-black text-slate-900">$3.99</span>
                <span className="text-slate-500 font-medium mb-1">/ month</span>
                <span className="ml-auto text-xs font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-lg">SAVE 60%</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Start Free Trial'}
                </button>

                {isOnboarding ? (
                  <button onClick={handleClose} className="w-full py-3 text-slate-400 text-sm font-bold hover:text-slate-600">
                    Skip for now
                  </button>
                ) : (
                  <p className="text-center text-xs text-slate-400">
                    Secure payment via Stripe. Cancel anytime.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
