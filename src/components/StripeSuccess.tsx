
import React, { useEffect } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StripeSuccess = () => {
    const { width, height } = useWindowSize();

    // Confetti runs for 5 seconds then stops
    const [runConfetti, setRunConfetti] = React.useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setRunConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleReturn = () => {
        // Force a reload or just navigate to dashboard to ensure state updates
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-surface-light flex items-center justify-center p-4 relative overflow-hidden">
            {runConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

            <div className="relative z-10 glass-card max-w-md w-full p-8 text-center animate-scale-in">

                {/* Success Icon */}
                <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 animate-bounce">
                    <Check size={48} className="text-white" strokeWidth={4} />
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-2">Welcome to Pro!</h1>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                    Your payment was successful. You now have unlimited access to LifeHub's premium features.
                </p>

                {/* Feature List */}
                <div className="bg-white/50 rounded-2xl p-6 mb-8 text-left space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Zap size={14} /></div>
                        <span className="text-sm font-bold text-slate-700">Unlimited AI Chats</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Zap size={14} /></div>
                        <span className="text-sm font-bold text-slate-700">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Zap size={14} /></div>
                        <span className="text-sm font-bold text-slate-700">Sync Across Devices</span>
                    </div>
                </div>

                <button
                    onClick={handleReturn}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group"
                >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};
