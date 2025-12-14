import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import { Check, Star, Zap, Shield, X, Loader2 } from 'lucide-react';

export const SubscriptionModal = () => {
  const { upgradeToPremium } = useAuth();
  const { setShowUpsell } = useApp();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await upgradeToPremium();
      setShowUpsell(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header Graphic */}
        <div className="relative h-32 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-90" />
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-[50px]" />
          <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-black/20 rounded-full blur-[50px]" />
          
          <button 
            onClick={() => setShowUpsell(false)}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2">
            <div className="flex items-center space-x-2 mb-1">
              <div className="bg-amber-400 text-amber-900 p-1 rounded-md">
                <Star size={14} fill="currentColor" />
              </div>
              <span className="font-bold text-sm tracking-widest uppercase text-indigo-100">Premium Access</span>
            </div>
            <h2 className="text-3xl font-extrabold">Unlock Your Brain</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            You've hit the limit for free tasks. Upgrade to LifeHub Pro to remove limits and get full AI power.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Unlimited Tasks & Habits</h4>
                <p className="text-sm text-slate-500">Capture everything without hitting a wall.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Advanced AI Insights</h4>
                <p className="text-sm text-slate-500">Weekly reports and deep habit analysis.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Voice Assistant Pro</h4>
                <p className="text-sm text-slate-500">Unlimited voice commands and brain dumps.</p>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between mb-8">
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase line-through">was $9.99/mo</p>
               <div className="flex items-baseline">
                 <span className="text-3xl font-extrabold text-slate-900">$3.99</span>
                 <span className="text-slate-500 font-bold ml-1">/ month</span>
               </div>
            </div>
            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
              Save 60%
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Zap size={20} fill="currentColor" className="text-amber-300" />
                <span>Upgrade to Pro</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => setShowUpsell(false)}
            className="w-full text-center py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
