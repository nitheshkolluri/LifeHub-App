import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import {
   CheckCircle2,
   Clock,
   CreditCard,
   LayoutDashboard,
   MoreHorizontal,
   Plus,
   Sun,
   Mic,
   DollarSign,
   ChevronRight,
   Zap,
   Flame,
} from 'lucide-react';
import { ViewState } from '../types';
import { VoiceOverlay } from './VoiceOverlay';

// --- SUB-COMPONENTS ---

// 1. Date Strip
const DateStrip = ({ selectedDate, onSelectDate }: { selectedDate: Date, onSelectDate: (d: Date) => void }) => {
   const dates = useMemo(() => {
      const arr = [];
      for (let i = -3; i <= 3; i++) {
         const d = new Date();
         d.setDate(d.getDate() + i);
         arr.push(d);
      }
      return arr;
   }, []);

   return (
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-2 no-scrollbar px-2">
         {dates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
               <button
                  key={idx}
                  onClick={() => onSelectDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-slate-400 hover:bg-indigo-50 hover:text-indigo-500'}`}
               >
                  <span className="text-[10px] uppercase font-bold tracking-wider">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{date.getDate()}</span>
                  {isToday && !isSelected && <span className="w-1 h-1 bg-indigo-500 rounded-full mt-1"></span>}
               </button>
            )
         })}
      </div>
   );
};

// 2. Metrics Card
const MetricCard = ({ title, value, subtext, icon: Icon, color }: any) => (
   <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
         <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
         <h3 className="text-2xl font-black text-slate-800">{value}</h3>
         <p className="text-xs text-slate-500 font-medium mt-1">{subtext}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
         <Icon size={24} className="text-white" />
      </div>
   </div>
);

export const Dashboard = () => {
   const { user } = useAuth();
   const { tasks, habits, finance, setView, toggleTask, processBrainDump } = useApp();
   const [selectedDate, setSelectedDate] = useState(new Date());
   const [showVoice, setShowVoice] = useState(false);

   // Filter Data based on Date
   const dateKey = selectedDate.toISOString().split('T')[0];

   const todaysTasks = useMemo(() => {
      return tasks.filter(t => {
         if (t.status === 'completed' && t.dueDate === dateKey) return true; // Completed today
         if (t.status === 'pending') {
            // Show if due today or overdue (and selected date is Today)
            if (t.dueDate === dateKey) return true;
            if (!t.dueDate) return selectedDate.toDateString() === new Date().toDateString(); // Show backlog only on "Today"
            // If viewing past, show what was due then? (Logic simplified for V2)
            return false;
         }
         return false;
      });
   }, [tasks, dateKey, selectedDate]);

   const pendingCount = todaysTasks.filter(t => t.status === 'pending').length;
   const completedCount = todaysTasks.filter(t => t.status === 'completed').length;

   // Finance Calc
   const monthlySpend = useMemo(() => {
      return finance.reduce((acc, item) => acc + item.amount, 0);
   }, [finance]);

   const nextBill = useMemo(() => {
      const pending = finance.filter(f => !f.isPaidThisMonth);
      if (pending.length === 0) return null;
      // Sort by due day logic (simplified)
      return pending[0];
   }, [finance]);

   const activeHabits = useMemo(() => {
      // Just show top 3 pending habits for orbit visual
      return habits.filter(h => !h.completedDates.includes(dateKey)).slice(0, 5);
   }, [habits, dateKey]);

   return (
      <div className="flex flex-col h-full space-y-6 animate-fade-in pb-24 md:pb-0">

         {/* HEADER */}
         <header className="flex items-center justify-between px-2">
            <div>
               <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Hello, {user?.name?.split(' ')[0] || 'User'}.
               </h1>
               <p className="text-slate-500 font-medium">Ready to conquer the day?</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shadow-sm border border-white">
               <Sun size={24} />
            </div>
         </header>

         {/* TIME MACHINE / DATE PICKER */}
         <section>
            <div className="flex items-center justify-between mb-2 px-2">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Timeline</h2>
               <button onClick={() => setSelectedDate(new Date())} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Jump to Today</button>
            </div>
            <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
         </section>

         {/* KEY METRICS GRID */}
         <section className="grid grid-cols-2 gap-4 px-2">
            <MetricCard
               title="Focus"
               value={`${completedCount}/${pendingCount + completedCount}`}
               subtext="Tasks Done"
               icon={CheckCircle2}
               color="bg-emerald-500"
            />
            <MetricCard
               title="Finance"
               value={`$${monthlySpend}`}
               subtext="Monthly Burn"
               icon={CreditCard}
               color="bg-rose-500"
            />
         </section>

         {/* FOCUS STREAM (Tasks) */}
         <section className="flex-1 overflow-hidden flex flex-col px-2">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Focus Stream</h2>
               <div className="flex gap-2">
                  <button onClick={() => setView(ViewState.TASKS)} className="bg-slate-100 p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                     <MoreHorizontal size={18} />
                  </button>
                  <button className="bg-indigo-600 p-2 rounded-xl text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                     <Plus size={18} />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
               {todaysTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                     <LayoutDashboard size={32} className="mb-2 opacity-50" />
                     <p className="font-medium text-sm">No tasks for this date.</p>
                  </div>
               ) : (
                  todaysTasks.map(task => (
                     <div key={task.id} className="group bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                        <button
                           onClick={() => toggleTask(task.id)}
                           className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-500'}`}
                        >
                           {task.status === 'completed' && <CheckCircle2 size={14} className="text-white" />}
                        </button>
                        <div className="flex-1">
                           <h3 className={`font-bold text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</h3>
                           <div className="flex items-center gap-2 mt-1">
                              {task.dueTime && (
                                 <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock size={10} /> {task.dueTime}
                                 </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === 'high' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                                 {task.priority}
                              </span>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </section>

         {/* HABIT ORBIT - Interactive */}
         < section className="px-2" >
            < div
               className="relative h-56 bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-xl group hover:border-emerald-200 transition-all"
            >
               <div className="absolute top-0 right-0 p-8 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
               <div className="absolute inset-0 p-6 flex flex-col z-10">
                  <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setView(ViewState.HABITS)}>
                     <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Rituals</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{activeHabits.length} Remaining</p>
                     </div>
                     <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ChevronRight size={20} />
                     </div>
                  </div>

                  {/* Horizontal Scrollable Habits */}
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 items-center h-full">
                     {activeHabits.length === 0 ? (
                        <div className="flex items-center gap-3 text-emerald-600 opacity-60">
                           <CheckCircle2 size={24} />
                           <span className="font-bold">All rituals complete.</span>
                        </div>
                     ) : (
                        activeHabits.map((h, i) => (
                           <button
                              key={h.id}
                              // onClick={() => toggleHabit(h.id)} // Assuming toggle/increment logic exists or we just view
                              className="flex-shrink-0 w-20 h-24 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 hover:shadow-md transition-all relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-50" />
                              <div className="relative z-10 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                 <Flame size={20} />
                              </div>
                              <span className="relative z-10 text-[10px] font-bold text-slate-600 text-center leading-tight line-clamp-2 px-1">{h.title}</span>
                           </button>
                        ))
                     )}
                     <button onClick={() => setView(ViewState.HABITS)} className="flex-shrink-0 w-12 h-24 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-colors">
                        <Plus size={20} />
                     </button>
                  </div>
               </div>
            </div >
         </section>

         {/* 3. FINANCE SNAPSHOT (Interactive) */}
         < section className="px-2" >
            < div
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

               {
                  nextBill ? (
                     <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                           <p className="text-xs font-bold text-rose-500">Upcoming Bill</p>
                           <p className="font-bold text-slate-700">{nextBill.title}</p>
                        </div>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-bold">No dues soon</span>
                     </div>
                  )
               }
            </div >
         </section>

         {/* 4. AI ASSISTANT PROMPT */}
         < section className="px-2" >
            <div
               onClick={() => setView(ViewState.ASSISTANT)}
               className="h-48 relative bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[40px] p-1 overflow-hidden shadow-2xl shadow-blue-200 group cursor-pointer"
            >
               <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="h-full bg-white/95 rounded-[36px] p-6 flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                     <Zap size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-800 mb-1">LifeHub Assistant</h3>
                     <p className="text-sm text-slate-500 leading-snug">
                        AI-powered brain dump active. <br />Tap to organize your thoughts.
                     </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 ml-auto group-hover:translate-x-1 transition-transform">
                     <ChevronRight size={20} />
                  </div>
               </div>
            </div>
         </section>

         {/* FLOATING MIC BUTTON */}
         {/* FLOATING MIC BUTTON */}
         <button
            onClick={() => setShowVoice(true)}
            className="fixed bottom-24 right-6 md:hidden z-50 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
         >
            <div className="absolute inset-0 bg-slate-700/50 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
            <Mic size={28} />
         </button>

         <VoiceOverlay isOpen={showVoice} onClose={() => setShowVoice(false)} />
      </div>
   );
};
