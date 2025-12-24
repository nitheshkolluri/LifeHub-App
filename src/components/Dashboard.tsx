import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useUsage } from '../store/UsageContext';
import { SmartCard } from './SmartCard';
import { ReschedulePrompt } from './ReschedulePrompt';
import { parseQuickly } from '../utils/quickParser';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
   Mic, ArrowRight, ChevronLeft, ChevronRight, Calendar,
   CheckCircle2, Flame, Wallet, ListFilter, Sparkles, X
} from 'lucide-react';
import { ViewState } from '../types';

// --- SUB-COMPONENT: CREATIVE DATE STRIP ---
const DateStrip = ({ selectedDate, onSelectDate }: { selectedDate: Date, onSelectDate: (d: Date) => void }) => {
   // Generate window of dates centered on selected
   const dates = useMemo(() => {
      const arr = [];
      // Show 2 days before and 2 days after, sliding window
      for (let i = -2; i <= 2; i++) {
         const d = new Date(selectedDate); // clone pivot
         d.setDate(selectedDate.getDate() + i);
         arr.push(d);
      }
      return arr;
   }, [selectedDate]);

   const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

   return (
      <div className="relative flex items-center justify-center py-4 mb-6">
         <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-3xl border border-slate-200/50 shadow-sm">
            <button onClick={() => {
               const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onSelectDate(d);
            }} className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
               <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
               {dates.map((date, i) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                     <button
                        key={i}
                        onClick={() => onSelectDate(date)}
                        className={`
                                    relative flex flex-col items-center justify-center w-12 h-14 rounded-2xl transition-all duration-300
                                    ${isSelected
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110 z-10'
                              : 'bg-white text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'
                           }
                                `}
                     >
                        <span className="text-[9px] uppercase font-bold tracking-widest leading-none mb-1">
                           {isToday(date) ? 'NOW' : date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}
                        </span>
                        <span className={`text-lg font-black leading-none ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                           {date.getDate()}
                        </span>
                     </button>
                  );
               })}
            </div>

            <button onClick={() => {
               const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onSelectDate(d);
            }} className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
               <ChevronRight size={18} />
            </button>
         </div>
      </div>
   );
};

// --- SUB-COMPONENT: SMART SECTION ---
const SmartSection = ({ title, icon: Icon, color, count, children, onAdd }: any) => (
   <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg} ${color.text}`}>
               <Icon size={20} />
            </div>
            <div>
               <h3 className="text-lg font-bold text-slate-800">{title}</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{count} Items</p>
            </div>
         </div>
         {onAdd && (
            <button onClick={onAdd} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
               <ListFilter size={16} />
            </button>
         )}
      </div>
      <div className="space-y-2">
         {children}
      </div>
   </div>
);

export const Dashboard = () => {
   // Context
   const {
      tasks, habits, finance,
      addTask, toggleTask, deleteTask, updateTask,
      addHabit, incrementHabit, deleteHabit,
      addFinanceItem, togglePaid, deleteFinanceItem,
      setView, processBrainDump
   } = useApp();
   const { user } = useAuth();
   const { incrementUsage } = useUsage();

   // State
   const [selectedDate, setSelectedDate] = useState(new Date());
   const [input, setInput] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showReschedule, setShowReschedule] = useState(false);
   const [overdueTasks, setOverdueTasks] = useState<any[]>([]);

   // Voice
   const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();

   // --- EFFECTS ---

   // 1. Sync Voice
   useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

   // 2. Check Overdue (Passive)
   useEffect(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const pending = tasks.filter(t => t.status === 'pending' && t.dueDate && t.dueDate < todayStr);
      setOverdueTasks(pending);
      // Removed auto-popup: setShowReschedule(true);
   }, [tasks]);

   // --- FILTERING LOGIC ---
   const dateKey = selectedDate.toISOString().split('T')[0];
   const isToday = dateKey === new Date().toISOString().split('T')[0];

   // Filter Tasks
   const activeTasks = useMemo(() => {
      return tasks.filter(t => {
         // Show completed ONLY if completed ON selected date
         if (t.status === 'completed') return false; // Hide completed for cleaner view? Or show strikethrough?
         // User requested "Show analysis". Maybe we show completed at bottom.

         // PENDING logic
         if (t.dueDate === dateKey) return true; // Due today
         if (!t.dueDate && isToday) return true; // Backlog shows on Today
         return false;
      }).sort((a, b) => (a.priority === 'high' ? -1 : 1));
   }, [tasks, dateKey, isToday]);

   const activeHabits = habits; // Show all habits everyday to check off? Or track history?
   // Filtering for "Habits Done on Date" handled in card rendering

   const activeFinance = finance.filter(f => {
      if (f.dueDate) return f.dueDate === dateKey;
      if (f.dueDay) {
         // Check if day matches selected date
         return selectedDate.getDate() === f.dueDay;
      }
      return false;
   });

   // --- HANDLERS ---
   const handleMicClick = () => {
      if (isListening) stopListening();
      else { resetTranscript(); startListening(); }
   };

   const handleDump = async (e?: React.KeyboardEvent) => {
      if ((e && e.key === 'Enter') || !e) {
         if (!input.trim()) return;
         setIsSubmitting(true);
         incrementUsage();

         try {
            // CRITICAL FIX: Use the centralized BrainDump processor (Quick + Cloud AI)
            // Previously this component bypassed Cloud AI for plain tasks.
            await processBrainDump(input);
         } catch (error) {
            console.error("Dashboard Dump Error:", error);
            // Fallback (handled in processBrainDump generally, but extra safety here)
            addTask(input, 'medium', dateKey);
         }

         setInput('');
         resetTranscript();
         setIsSubmitting(false);
      }
   };

   const handleReschedule = (ids: string[]) => {
      const todayStr = new Date().toISOString().split('T')[0];
      ids.forEach(id => updateTask(id, { dueDate: todayStr }));
      setShowReschedule(false);
   };

   return (
      <div className="max-w-xl mx-auto pb-24 px-4 pt-6 font-sans text-slate-800 animate-fade-in">

         {/* 1. GREETING & DATE */}
         <header className="mb-2 text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
               {new Date().getHours() < 12 ? 'Good morning' : 'Hello'}, {user?.name?.split(' ')[0] || 'Friend'}
            </h1>
            <p className="text-slate-400 font-medium text-sm">Let's make today count.</p>
         </header>

         <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

         {/* 2. MAIN INPUT */}
         <div className={`relative mb-10 transition-all ${isListening ? 'scale-105' : ''}`}>
            <div className="relative group bg-white rounded-[28px] shadow-lg shadow-indigo-100 border border-slate-100 p-2 flex items-center transition-all focus-within:ring-4 focus-within:ring-indigo-50/50 focus-within:border-indigo-200">
               <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleDump}
                  placeholder={isListening ? "Listening..." : "Rent, Buy milk, Call mom..."}
                  className="flex-1 bg-transparent border-none outline-none text-lg font-bold px-4 text-slate-800 placeholder:text-slate-300 h-14"
                  disabled={isSubmitting}
                  autoFocus
               />

               {/* CLEAR BUTTON */}
               {input && !isListening && (
                  <button
                     onClick={() => { setInput(''); resetTranscript(); }}
                     className="absolute right-16 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                     <ListFilter size={20} className="rotate-45" /> {/* Using ListFilter as generic X since X isn't imported, wait, X is not in import list? Let's check imports. */}
                  </button>
               )}

               {/* MIC BUTTON - HIGHLIGHTED */}
               <button
                  onClick={() => input && !isListening ? handleDump() : handleMicClick()}
                  className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 ${isListening
                     ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse scale-105'
                     : input
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105'
                        : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'
                     }`}
               >
                  {input && !isListening ? <ArrowRight size={24} /> : <Mic size={24} />}
               </button>
            </div>
            {/* Visual Feedback for Input Type */}
            <div className="absolute -bottom-6 left-6 text-xs font-bold uppercase tracking-wide text-slate-300 flex items-center gap-2">
               <Sparkles size={12} className="text-indigo-400" />
               <span>AI Auto-Categorization Active</span>
            </div>
         </div>

         {/* 2.5. NOTIFICATIONS SECTION */}
         {overdueTasks.length > 0 && (
            <div className="mb-8 animate-slide-down">
               <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800 text-sm">Review Yesterday</h3>
                        <p className="text-xs text-slate-500">{overdueTasks.length} tasks pending from the past.</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setShowReschedule(true)}
                     className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                     Review
                  </button>
               </div>
            </div>
         )}

         {/* 3. SECTIONS GRID */}
         <div className="space-y-6">

            {/* TASKS */}
            <SmartSection
               title="Focus"
               count={activeTasks.length}
               icon={CheckCircle2}
               color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
               onAdd={() => setView(ViewState.TASKS)}
            >
               {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 italic text-sm">No tasks for {isToday ? 'today' : 'this date'}. Enjoy the calm.</div>
               ) : (
                  activeTasks.map(t => (
                     <SmartCard
                        key={t.id}
                        title={t.title}
                        subtitle={t.dueTime ? `Due ${t.dueTime}` : null}
                        color="text-indigo-600"
                        isCompleted={t.status === 'completed'}
                        onToggle={() => toggleTask(t.id)}
                        onDelete={() => deleteTask(t.id)}
                     />
                  ))
               )}
            </SmartSection>

            {/* HABITS */}
            <SmartSection
               title="Rituals"
               count={habits.length}
               icon={Flame}
               color={{ bg: 'bg-orange-50', text: 'text-orange-500' }}
               onAdd={() => setView(ViewState.HABITS)}
            >
               <div className="grid grid-cols-2 gap-2">
                  {habits.map(h => {
                     const isDone = h.completedDates.includes(dateKey);
                     return (
                        <div key={h.id} onClick={() => incrementHabit(h.id)} className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 ${isDone ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-sm'}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-orange-500 text-white' : 'bg-white text-slate-300'}`}>
                              <Flame size={14} className={isDone ? 'fill-current' : ''} />
                           </div>
                           <div>
                              <p className={`text-sm font-bold ${isDone ? 'text-orange-900' : 'text-slate-600'}`}>{h.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{h.streak} Day Streak</p>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </SmartSection>

            {/* FINANCE */}
            {activeFinance.length > 0 && (
               <SmartSection
                  title="Vault"
                  count={activeFinance.length}
                  icon={Wallet}
                  color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
               >
                  {activeFinance.map(f => (
                     <SmartCard
                        key={f.id}
                        title={f.title}
                        subtitle={f.type === 'bill' ? 'Bill' : 'Expense'}
                        icon={<span>${f.amount}</span>}
                        color="text-emerald-600"
                        isCompleted={f.isPaidThisMonth} // Simplification
                        onToggle={() => togglePaid(f.id)}
                     />
                  ))}
               </SmartSection>
            )}

         </div>

         {/* 4. RESCHEDULE PROMPT */}
         {showReschedule && (
            <ReschedulePrompt
               overdueTasks={overdueTasks}
               onReschedule={handleReschedule}
               onDismiss={() => setShowReschedule(false)}
            />
         )}

      </div>
   );
};
