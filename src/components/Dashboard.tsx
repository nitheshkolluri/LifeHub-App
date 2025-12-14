
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { CheckCircle2, DollarSign, Wind, ArrowRight, Zap, Droplets, Mountain } from 'lucide-react';

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
  const { tasks, habits, finance, toggleTask, incrementHabit, setView } = useApp();
  const { user } = useAuth();
  
  // -- Data Processing --
  const todayStr = new Date().toDateString();
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const highPriorityTask = pendingTasks.find(t => t.priority === 'high') || pendingTasks[0];
  const completedToday = tasks.filter(t => t.status === 'completed' && new Date(t.createdAt).toDateString() === todayStr).length;
  const totalTasks = completedToday + pendingTasks.length;
  const progress = totalTasks > 0 ? (completedToday / totalTasks) : 0;
  
  // Finance Snapshot
  const upcomingBills = finance.filter(f => !f.isPaidThisMonth).sort((a,b) => (a.dueDay || 32) - (b.dueDay || 32));
  const nextBill = upcomingBills[0];

  // Habit Processing for Satellites
  const activeHabits = habits.filter(h => !h.completedDates.includes(new Date().toISOString().split('T')[0]));
  
  // -- State for Interactions --
  const [showFinanceDetail, setShowFinanceDetail] = useState(false);

  // -- Dynamic Styling based on State --
  // Calm Blue (Start) -> Energetic Purple (Mid) -> Success Green (Done)
  const getBlobColor = () => {
    if (progress === 1 && totalTasks > 0) return 'from-emerald-400 to-teal-500 shadow-emerald-200';
    if (pendingTasks.length > 5) return 'from-rose-400 to-orange-500 shadow-rose-200'; // Stress mode
    return 'from-indigo-500 to-purple-600 shadow-indigo-300'; // Default flow
  };

  const getMotivationalWord = () => {
    if (progress === 1 && totalTasks > 0) return "Zen";
    if (pendingTasks.length > 5) return "Focus";
    if (completedToday === 0 && pendingTasks.length === 0) return "Free";
    return "Flow";
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center pt-8 md:pt-12 animate-fade-in font-sans">
      <style>{fluidStyles}</style>

      {/* --- HEADER --- */}
      <div className="z-10 text-center space-y-1 mb-8">
         <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Second Brain</p>
         <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
            {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.name.split(' ')[0]}
         </h1>
      </div>

      {/* --- THE LIFE CORE (Visualization) --- */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-12 flex-shrink-0">
         
         {/* Background Glow */}
         <div className={`absolute inset-0 bg-gradient-to-tr ${getBlobColor()} opacity-20 blur-[60px] rounded-full animate-pulse`} />

         {/* The Blob */}
         <div 
            className={`blob relative w-64 h-64 bg-gradient-to-br ${getBlobColor()} flex items-center justify-center shadow-2xl transition-all duration-1000 cursor-pointer group`}
            onClick={() => setView('TASKS' as any)}
         >
            {/* Inner texture/noise */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] rounded-[inherit]" />
            
            <div className="text-center text-white z-10 transform transition-transform group-hover:scale-110">
               <span className="block text-6xl font-black tracking-tighter drop-shadow-md">
                 {Math.round(progress * 100)}%
               </span>
               <span className="text-sm font-bold uppercase tracking-widest opacity-80 mt-1 block">
                 {getMotivationalWord()}
               </span>
            </div>
         </div>

         {/* Orbiting Habits (Satellites) */}
         {activeHabits.slice(0, 3).map((habit, index) => {
            // Calculate random delay for organic feel
            const delay = index * -2; 
            return (
               <div key={habit.id} className="orbit-container" style={{ animation: `orbit ${15 + index * 5}s linear infinite`, animationDelay: `${delay}s` }}>
                  <button 
                     onClick={() => incrementHabit(habit.id)}
                     className="satellite blob bg-white/80 backdrop-blur-md border border-white shadow-lg flex items-center justify-center text-indigo-600 hover:scale-125 hover:bg-white transition-all duration-300"
                     title={`Complete: ${habit.title}`}
                  >
                     <Zap size={20} fill="currentColor" />
                  </button>
               </div>
            );
         })}
      </div>

      {/* --- THE DECK (Interactive Cards) --- */}
      <div className="w-full max-w-md px-6 flex-1 flex flex-col justify-end pb-24 md:pb-10 space-y-4 z-10">
         
         {/* 1. The "Next Action" Card (Highest Priority) */}
         <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-[32px] blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wide">
                        Up Next
                     </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                     <Wind size={16} />
                  </div>
               </div>
               
               {highPriorityTask ? (
                  <>
                     <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2 line-clamp-2">
                        {highPriorityTask.title}
                     </h3>
                     <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                           {highPriorityTask.dueTime ? `Due ${highPriorityTask.dueTime}` : 'Do it today'}
                        </span>
                        <button 
                           onClick={() => toggleTask(highPriorityTask.id)}
                           className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-300 hover:bg-indigo-600 transition-colors active:scale-95"
                        >
                           <span>Complete</span>
                           <ArrowRight size={16} />
                        </button>
                     </div>
                  </>
               ) : (
                  <div className="text-center py-4">
                     <p className="text-slate-500 font-medium">All clear. Enjoy the calm.</p>
                     <button onClick={() => setView('TASKS' as any)} className="mt-2 text-indigo-600 text-sm font-bold">Add Task</button>
                  </div>
               )}
            </div>
         </div>

         {/* 2. The "Finance" Pill (Expandable) */}
         <div 
            onClick={() => setShowFinanceDetail(!showFinanceDetail)}
            className={`relative overflow-hidden bg-slate-900 text-white rounded-[28px] transition-all duration-500 ease-spring ${showFinanceDetail ? 'h-48' : 'h-16'} shadow-xl cursor-pointer`}
         >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
            
            {/* Collapsed View */}
            <div className={`absolute inset-0 flex items-center justify-between px-6 transition-opacity duration-300 ${showFinanceDetail ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/10 rounded-full">
                     <DollarSign size={16} className="text-emerald-400" />
                  </div>
                  <span className="font-bold text-sm">
                     {nextBill ? `Upcoming: ${nextBill.title}` : 'Wallet Healthy'}
                  </span>
               </div>
               <span className="text-xs font-bold text-slate-400 bg-white/10 px-2 py-1 rounded-lg">
                  {nextBill ? `$${nextBill.amount}` : 'See Wallet'}
               </span>
            </div>

            {/* Expanded View */}
            <div className={`absolute inset-0 p-6 flex flex-col justify-between transition-opacity duration-500 delay-100 ${showFinanceDetail ? 'opacity-100' : 'opacity-0'}`}>
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Snapshot</p>
                     <h3 className="text-2xl font-bold mt-1">
                        {nextBill ? `$${nextBill.amount}` : 'All Paid'}
                     </h3>
                     <p className="text-sm text-slate-300">
                        {nextBill ? `due for ${nextBill.title}` : 'No upcoming bills shortly.'}
                     </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                     <Mountain size={20} />
                  </div>
               </div>
               
               <div className="flex gap-2">
                  <button 
                     onClick={(e) => { e.stopPropagation(); setView('FINANCE' as any); }}
                     className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-colors"
                  >
                     Open Wallet
                  </button>
                  <button 
                     onClick={(e) => { e.stopPropagation(); setShowFinanceDetail(false); }}
                     className="px-4 bg-transparent border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5"
                  >
                     Close
                  </button>
               </div>
            </div>
         </div>

      </div>

      {/* Decorative Background Elements for "Anime" feel */}
      <div className="absolute top-20 right-[-50px] w-64 h-64 bg-indigo-300/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-20 left-[-50px] w-80 h-80 bg-rose-300/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
      
    </div>
  );
};
