
import React from 'react';
import { useAuth } from '../store/AuthContext';
import { BrainCircuit, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
       <div className="max-w-md w-full space-y-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-300 transform rotate-12">
             <BrainCircuit className="text-white" size={40} />
          </div>
          
          <div className="space-y-4">
             <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Meet LifeHub.</h1>
             <p className="text-lg text-slate-500 leading-relaxed">
                Your digital second brain. Capture ideas in seconds, let AI organize the chaos, and regain your mental clarity.
             </p>
          </div>

          <div className="grid gap-4 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Sparkles size={18} /></div>
                <div>
                   <h3 className="font-bold text-slate-800">Neural Capture</h3>
                   <p className="text-xs text-slate-500">Speak naturally. We parse tasks, habits, and bills automatically.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0"><ShieldCheck size={18} /></div>
                <div>
                   <h3 className="font-bold text-slate-800">Privacy First</h3>
                   <p className="text-xs text-slate-500">Financial data is self-reported and stored securely. No bank connections.</p>
                </div>
             </div>
          </div>

          <button 
             onClick={onComplete}
             className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
             <span>Start Organizing</span>
             <ArrowRight size={20} />
          </button>
       </div>
    </div>
  );
};
