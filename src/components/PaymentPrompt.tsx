
import React from 'react';
import { X, Check, Star, Lock } from 'lucide-react';
import { useUsage } from '../store/UsageContext';
import { getEnv } from '../utils/env';
import { apiService } from '../services/api.service';

import { useApp } from '../store/AppContext';

export const PaymentPrompt: React.FC = () => {
    const { showPaywall, setShowPaywall } = useUsage();
    const { showUpsell, setShowUpsell } = useApp();

    const isVisible = showPaywall || showUpsell;

    const handleClose = () => {
        setShowPaywall(false);
        setShowUpsell(false);
    };

    const handleUpgrade = async () => {
        try {
            const priceId = getEnv('VITE_STRIPE_PRICE_ID_PRO_MONTHLY');
            console.log("Debug: Attempting upgrade with Price ID:", priceId);
            console.log("Debug: Full Env Objects:", (window as any).env);

            if (!priceId) {
                alert(`Configuration Error: Price ID is missing.\n\nPlease check your Cloud Run FRONTEND variables.\nOnly found keys: ${Object.keys((window as any).env || {}).join(', ')}`);
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
            console.error("Failed to start checkout", error);
            alert(`Checkout Failed.\n\nError: ${(error as any).message}\n\nCheck Console for CORS or Network errors.`);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                onClick={handleClose}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in glass-modal">

                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                            <Lock size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Free Limit Reached</h2>
                        <p className="text-indigo-100">Unlock unlimited access with Premium</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Check size={18} />
                            </div>
                            <span className="text-gray-700 font-medium pt-0.5">Unlimited AI Interactions</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Check size={18} />
                            </div>
                            <span className="text-gray-700 font-medium pt-0.5">Advanced Analytics</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Check size={18} />
                            </div>
                            <span className="text-gray-700 font-medium pt-0.5">Priority Support</span>
                        </div>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group"
                    >
                        <Star className="fill-white" size={20} />
                        <span>Upgrade to Premium</span>
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Secure payment powered by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
};
