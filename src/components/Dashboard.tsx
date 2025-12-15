
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { CheckCircle2, DollarSign, Wind, ArrowRight, Zap, Droplets, Mountain, Globe } from 'lucide-react';
import { ViewState } from '../types';

// --- STYLES & ANIMATIONS ---
// We inject these styles dynamically for the fluid animations
const fluidStyles = `
  @keyframes morph {
    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }
  @keyframes float-y {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  @keyframes pulse-glow {
    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
    70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  }
  .blob {
    animation: morph 8s ease-in-out infinite;
    transition: all 1s ease;
  }
  .orbit-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 2px;
  }
  .satellite {
    position: absolute;
    top: -20px;
    left: -20px;
    width: 40px;
    height: 40px;
  }
`;

export const Dashboard = () => {
   const { tasks, habits, finance, setView, toggleTask, incrementHabit } = useApp();
   const { user } = useAuth();
   const [mounted, setMounted] = useState(false);
   const [isVoiceMode, setIsVoiceMode] = useState(false); // Voice Overlay State

   useEffect(() => setMounted(true), []);

   // -- DEFENSIVE CODING: Ensure arrays exist (Fix for "M is not a function") --
   const safeTasks = Array.isArray(tasks) ? tasks : [];
   const safeHabits = Array.isArray(habits) ? habits : [];
   const safeFinance = Array.isArray(finance) ? finance : [];

   // -- STATS & DERIVED STATE --
   const pendingTasks = safeTasks.filter(t => t.status === 'pending');
   const completedToday = safeTasks.filter(t => t.status === 'completed' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
   const totalTasks = completedToday + pendingTasks.length;
   const progress = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0;
   const nextBill = safeFinance.filter(f => !f.isPaidThisMonth).sort((a, b) => (a.dueDay || 32) - (b.dueDay || 32))[0];
   const activeHabits = safeHabits.filter(h => !h.completedDates.includes(new Date().toISOString().split('T')[0]));

   // Dynamic Stress/Mood Logic (Depends on pendingTasks)
   const stressLevel = pendingTasks.length;

   const getMoodGradient = () => {
      if (stressLevel >= 5) return 'from-rose-600 via-orange-700 to-slate-900'; // High Stress
      if (stressLevel >= 3) return 'from-indigo-600 via-purple-700 to-slate-900'; // Medium Flow
      return 'from-emerald-600 via-teal-700 to-slate-900'; // Zen/Low Stress
   };

   const getPulseColor = () => {
      if (stressLevel >= 5) return 'bg-rose-500/30';
      if (stressLevel >= 3) return 'bg-indigo-500/30';
      return 'bg-emerald-500/30';
   };

   if (!mounted) return null;

   // -- Handlers --
   const handleTaskToggle = (id: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card navigation
      toggleTask(id);
   };


   return (
      <div className="h-full w-full overflow-y-auto p-4 md:p-8 font-sans scroll-smooth pb-32 md:pb-10">
         <header className="mb-8 animate-fade-in-up flex justify-between items-start">
            <div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                     {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
                  </span><br />
                  {user?.name ? user.name.split(' ')[0] : 'Explorer'}
               </h1>
               <p className="text-slate-500 font-medium mt-2">
                  {stressLevel > 4 ? "Let's tackle this chaos together." : "Everything is in perfect balance."}
               </p>
            </div>
            {/* NOTIFICATION BELL */}
            <button
               onClick={() => {
                  if ("Notification" in window && Notification.permission !== "granted") {
                     Notification.requestPermission().then(p => {
                        if (p === "granted") new Notification("Notifications Active", { body: "You will now receive precision alerts.", icon: "/icon-v2.png" });
                     });
                  } else {
                     new Notification("Test Alert", { body: "Notifications are working perfectly.", icon: "/icon-v2.png" });
                  }
               }}
               className="p-3 bg-white rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
               title="Enable Alerts"
            >
               <Zap size={20} />
            </button>
         </header>

         {/* BENTO GRID LAYOUT */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-stagger-in">

            {/* 1. MAIN FOCUS (Tasks) - Interactive */}
            <div
               className="md:col-span-2 relative h-64 md:h-80 bg-slate-900 rounded-[40px] overflow-hidden group shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 transition-all"
            >
               {/* Backgrounds */}
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
               <div className={`absolute inset-0 bg-gradient-to-br ${getMoodGradient()} opacity-90 transition-all duration-1000 pointer-events-none`} />

               {/* LIFE CORE VISUALIZATION (Orb + Satellites) */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <div className={`w-64 h-64 ${getPulseColor()} rounded-full blur-3xl animate-pulse transition-colors duration-1000 z-0`} />

                  {/* Orbit Container */}
                  <div className="orbit-container animate-[orbit_20s_linear_infinite] z-0 opacity-50">
                     {activeHabits.map((h, i) => (
                        <div
                           key={h.id}
                           className="satellite bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/20 shadow-lg"
                           style={{ transform: `rotate(${i * (360 / Math.max(activeHabits.length, 1))}deg) translateX(100px) rotate(-${i * (360 / Math.max(activeHabits.length, 1))}deg)` }}
                        >
                           <Zap size={16} className="text-white" />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
                  <div className="flex justify-between items-start cursor-pointer" onClick={() => setView(ViewState.TASKS)}>
                     <div>
                        <h2 className="text-3xl font-black tracking-tight">{Math.round(progress)}% Focused</h2>
                        <p className="text-white/70 font-medium">
                           {stressLevel} missions remaining
                        </p>
                     </div>
                     <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                        <ArrowRight size={24} />
                     </div>
                  </div>

                  {/* Interactive Task List */}
                  <div className="space-y-3 z-20">
                     {pendingTasks.slice(0, 3).map(t => (
                        <div
                           key={t.id}
                           onClick={(e) => handleTaskToggle(t.id, e)}
                           className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-colors cursor-pointer group/item"
                        >
                           <div className={`w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center transition-colors group-hover/item:border-emerald-400 ${t.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : ''}`}>
                              {/* Checkbox visual */}
                              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity" />
                           </div>
                           <span className="font-bold text-sm truncate group-hover/item:line-through transition-all">{t.title}</span>
                        </div>
                     ))}
                     {pendingTasks.length === 0 && (
                        <div className="text-indigo-200 font-bold flex items-center gap-2">
                           <CheckCircle2 size={20} />
                           <span>System Clear. Enjoy the calm.</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* 2. HABIT ORBIT - Interactive */}
            <div
               className="relative h-64 md:h-80 bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-xl group hover:border-emerald-200 transition-all"
            >
               <div className="absolute top-0 right-0 p-8 w-full h-full bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
               <div className="absolute inset-0 p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-6 cursor-pointer" onClick={() => setView(ViewState.HABITS)}>
                     <h3 className="text-xl font-black text-slate-800">Habits</h3>
                     <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                        <Zap size={20} fill="currentColor" />
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-4">
                     {activeHabits.length > 0 ? (
                        activeHabits.slice(0, 3).map(h => (
                           <div
                              key={h.id}
                              className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
                              onClick={() => incrementHabit(h.id)} // Direct increment
                           >
                              <span className="font-bold text-slate-600">{h.title}</span>
                              <div className="h-6 w-24 bg-slate-100 rounded-full overflow-hidden relative">
                                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400 z-10">
                                    Tap to Fill
                                 </div>
                                 <div className="h-full bg-emerald-500 w-1/5 transition-all duration-300" />
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="text-center text-slate-400">
                           <Mountain size={48} className="mx-auto mb-2 opacity-50" />
                           <p className="text-xs font-bold uppercase">All Rituals Done</p>
                        </div>
                     )}
                  </div>

                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-auto">
                     {habits.length - activeHabits.length} / {habits.length} Complete
                  </p>
               </div>
            </div>

            {/* 3. FINANCE SNAPSHOT (Interactive) */}
            <div
               onClick={() => setView(ViewState.FINANCE)}
               className="relative h-48 bg-slate-50 rounded-[40px] p-8 flex flex-col justify-between border border-dashed border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
            >
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase">Wallet</p>
                     <p className="text-2xl font-black text-slate-800 mt-1">
                        {nextBill ? `$${nextBill.amount}` : 'Healthy'}
                     </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                     <DollarSign size={20} />
                  </div>
               </div>

               {nextBill ? (
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-bold text-rose-500">Upcoming Bill</p>
                        <p className="font-bold text-slate-700">{nextBill.title}</p>
                     </div>
                     {/* <button className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded">Pay</button> */}
                  </div>
               ) : (
                  <div className="flex items-center gap-2 text-emerald-600">
                     <CheckCircle2 size={16} />
                     <span className="text-sm font-bold">No dues soon</span>
                  </div>
               )}
            </div>

            {/* 4. AI ASSISTANT PROMPT */}
            <div className="md:col-span-2 h-48 relative bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[40px] p-1 overflow-hidden shadow-2xl shadow-blue-200 group">
               <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="h-full bg-white/95 rounded-[36px] p-6 flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                     <Zap size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-800">Need clarity?</h3>
                     <p className="text-slate-500 text-sm mb-3">Ask about your day, budget, or justvent.</p>
                     <button
                        onClick={() => setView(ViewState.ASSISTANT)}
                        className="text-indigo-600 font-black text-sm uppercase tracking-wide flex items-center gap-1 hover:gap-2 transition-all"
                     >
                        Chat with Assistant <ArrowRight size={14} />
                     </button>
                  </div>

                  {/* Decorative */}
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                     <Globe size={120} />
                  </div>
               </div>
            </div>

         </div>

         {/* FLOATING MIC BUTTON (Invokes Voice Dashboard as Overlay) */}
         <button
            onClick={() => setIsVoiceMode(true)}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-16 h-16 bg-rose-600 rounded-full text-white shadow-2xl shadow-rose-500/50 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50 animate-bounce-in"
         >
            <Wind size={28} />
         </button>

         {/* VOICE MODE OVERLAY (Brain Dump) */}
         {isVoiceMode && (
            <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl animate-fade-in flex flex-col items-center justify-center p-6">

               <button onClick={() => setIsVoiceMode(false)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-all">
                  <CheckCircle2 size={24} />
               </button>

               <div className="flex flex-col items-center justify-center max-w-md w-full text-center space-y-8 animate-slide-up">

                  {/* Visualizer */}
                  <div className="relative group cursor-pointer" onClick={() => setIsVoiceMode(false)}>
                     <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                     <div className="absolute inset-[-20px] bg-rose-500 rounded-full animate-pulse opacity-10"></div>
                     <div className="w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-rose-500/50 relative z-10 transition-transform group-hover:scale-95">
                        <Wind size={48} className="animate-pulse" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h2 className="text-4xl font-black text-white tracking-tight">Listening...</h2>
                     <p className="text-lg text-slate-300 font-medium leading-relaxed">
                        "Buy milk, gym at 5pm, and pay internet bill." <br />
                        <span className="text-white/40 text-sm mt-2 block">Speak naturally. I'll sort it into Tasks, Habits, & Finance.</span>
                     </p>
                  </div>

                  {/* Manual Controls (Hidden for seamless feel, but good for accessibility/fallback) */}
                  <button
                     onClick={() => { setView(ViewState.ASSISTANT); setIsVoiceMode(false); }}
                     className="mt-8 text-sm font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                     Or swap to Chat <ArrowRight size={14} />
                  </button>

                  <VoiceRecorder
                     onResult={async (text) => {
                        // Auto-Process
                        new Notification("Processing Brain Dump...", { body: " organizing your thoughts." });
                        try {
                           const result = await processBrainDump(text);
                           setIsVoiceMode(false);
                           // Show success feedback (toast replacement)
                           alert(`Captured ${result.entities.length} items from your brain dump!`);
                        } catch (e) {
                           alert("Could not process voice. Please try again.");
                        }
                     }}
                     onClose={() => setIsVoiceMode(false)}
                  />
               </div>
            </div>
         )}
      </div>
   );
};

// End of Dashboard
