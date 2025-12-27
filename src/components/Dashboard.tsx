import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { toast } from 'react-hot-toast';
import { DateStrip } from './DateStrip';
import { isSameDay, format, addDays } from 'date-fns';
import { Flame, Wallet, Trash2, Clock, CalendarClock } from 'lucide-react';
import { ViewState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartCard } from './SmartCard';
import { ArrowRight, Check, Plus, RotateCcw } from 'lucide-react';
import { SwipeActionRow } from './SwipeActionRow';
import { ReschedulePrompt } from './ReschedulePrompt';

// --- HELPER: LOCAL DATE STRING YYYY-MM-DD ---
const toLocalISOString = (date: Date) => {
   const offset = date.getTimezoneOffset() * 60000;
   return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export const Dashboard = () => {
   const {
      tasks, habits, finance,
      currentView, setView,
      addTask, updateTask, deleteTask, setEditingTaskId,
      incrementHabit, decrementHabit, updateHabit, deleteHabit,
      togglePaid, updateFinanceItem, deleteFinanceItem
   } = useApp();

   const { user } = useAuth();

   // State


   // State
   const [selectedDate, setSelectedDate] = useState(new Date());
   const [showAllTasks, setShowAllTasks] = useState(false);
   const [showOverdueModal, setShowOverdueModal] = useState(false);

   // Derived State
   const formattedDate = toLocalISOString(selectedDate);

   // Tasks for the selected date
   const timelineItems = useMemo(() => {
      const isToday = isSameDay(selectedDate, new Date());
      return tasks.filter(t => {
         // Show undated if Today
         if (!t.dueDate && isToday) return true;
         // Show completed if completed ON this date
         if (t.status === 'completed') return t.dueDate === formattedDate;
         // Show pending if due on this date (or overdue if today? No, overdue is separate now)
         return t.dueDate === formattedDate;
      }).sort((a, b) => { // High Priority First
         const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
         return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      });
   }, [tasks, selectedDate, formattedDate]);

   // Overdue Tasks (Always based on Today)
   const overdueTasks = useMemo(() => {
      const todayStr = toLocalISOString(new Date());
      return tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'completed');
   }, [tasks]);

   const overdueCount = overdueTasks.length;

   // View items (Limit 4 unless show all)
   const visibleItems = showAllTasks ? timelineItems : timelineItems.slice(0, 4);

   // Handlers
   const handleReschedule = (task: any) => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrow = toLocalISOString(d);
      updateTask(task.id, { dueDate: tomorrow });
      toast.success("Moved to tomorrow");
   };

   const handleEditTask = (task: any) => {
      setEditingTaskId(task.id);
      setView(ViewState.TASKS);
   };

   const handleBulkMoveToToday = (taskIds: string[]) => {
      const today = toLocalISOString(new Date());
      taskIds.forEach(id => updateTask(id, { dueDate: today }));
      toast.success(`${taskIds.length} tasks moved to Today`);
      setShowOverdueModal(false);
   };

   // Time Greeting
   const getGreeting = () => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 18) return 'Good afternoon';
      return 'Good evening';
   };

   return (
      <div className="pb-32 animate-in fade-in pt-safe">
         <div className="flex items-center justify-between px-6 mb-2">
            <div>
               <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                  {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">{user?.name?.split(' ')[0]}</span>
               </h1>
               <p className="text-zinc-500 font-medium text-sm mt-0.5">
                  {visibleItems.length === 0 ? (
                     "No tasks scheduled for today."
                  ) : (
                     "Ready to conquer the day?"
                  )}
               </p>
            </div>
            {/* User Profile / Settings ? */}
         </div>

         {/* OVERDUE BANNER */}
         {overdueCount > 0 && (
            <div
               onClick={() => setShowOverdueModal(true)}
               className="mx-2 mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                     <Clock size={20} />
                  </div>
                  <div>
                     <h3 className="font-bold text-rose-700 text-sm">Action Required</h3>
                     <p className="text-rose-500 text-xs font-semibold">{overdueCount} tasks need attention.</p>
                  </div>
               </div>
               <ArrowRight size={18} className="text-rose-400" />
            </div>
         )}

         {/* DATE STRIP HEADER */}
         <div className="px-2 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-black text-zinc-900">
               {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}
            </h2>
            <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">
               {format(selectedDate, 'MMM do')}
            </span>
         </div>

         {/* 2. DATE STRIP */}
         <div className="mb-8">
            <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
         </div>

         {/* 3. TASK CARDS (Smart Swipeable) */}
         <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">My Focus</h3>
               {timelineItems.length > 4 && (
                  <button
                     onClick={() => setShowAllTasks(!showAllTasks)}
                     className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                     {showAllTasks ? 'Show Less' : `See All (${timelineItems.length})`}
                  </button>
               )}
            </div>

            {visibleItems.length === 0 && timelineItems.length === 0 ? (
               <div className="py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-white/50">
                  <p className="text-zinc-400 italic mb-2">No tasks for this day.</p>
                  <p className="text-sm text-zinc-500">Tap the mic to plan ahead.</p>
               </div>
            ) : (
               <AnimatePresence mode="popLayout">
                  {visibleItems.map((task) => (
                     <div key={task.id} className="mb-3">
                        <SwipeActionRow
                           onEdit={() => handleEditTask(task)}
                           onReschedule={() => handleReschedule(task)}
                           onDelete={() => {
                              deleteTask(task.id);
                              toast.success("Task deleted");
                           }}
                        >
                           <SmartCard
                              title={task.title}
                              subtitle={task.dueTime || 'Anytime'}
                              priority={task.priority}
                              isCompleted={task.status === 'completed'}
                              isOverdue={task.dueDate && task.dueDate < toLocalISOString(new Date())}
                              onToggle={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                              onDelete={() => deleteTask(task.id)}
                              onEdit={() => handleEditTask(task)}
                           />
                        </SwipeActionRow>
                     </div>
                  ))}
               </AnimatePresence>
            )}
         </div>

         {/* 4. OTHER SECTIONS (Habits/Finance) */}
         <div className="mt-10 px-2">
            <h3
               onClick={() => setView(ViewState.HABITS)}
               className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
            >
               <Flame size={14} className="text-rose-400" /> Habits
            </h3>
            {habits.length === 0 ? (
               <div className="text-zinc-400 text-sm italic pl-2">No active habits.</div>
            ) : (
               <div className="space-y-3">
                  {habits.map(h => {
                     const today = toLocalISOString(new Date());
                     const isDoneToday = h.completedDates.includes(today);
                     return (
                        <div key={h.id} className="rounded-3xl overflow-hidden">
                           <SwipeActionRow
                              onDelete={() => deleteHabit(h.id)}
                              onEdit={() => {
                                 const newTitle = prompt("Edit Habit Title", h.title);
                                 if (newTitle) updateHabit(h.id, { title: newTitle });
                              }}
                           >
                              <div className={`bg-white p-5 rounded-3xl border transition-all flex items-center justify-between shadow-sm ${isDoneToday ? 'border-emerald-100 bg-emerald-50/30' : 'border-zinc-100'}`}>
                                 <div>
                                    <span className={`font-bold block transition-all ${isDoneToday ? 'text-emerald-700 line-through decoration-emerald-300 decoration-2' : 'text-zinc-800'}`}>
                                       {h.title}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{h.streak} Day Streak</span>
                                 </div>

                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       if (isDoneToday) decrementHabit(h.id);
                                       else incrementHabit(h.id);
                                    }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDoneToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-zinc-100 text-zinc-400 hover:bg-emerald-500 hover:text-white'}`}
                                 >
                                    {isDoneToday ? <RotateCcw size={18} /> : <Plus size={20} />}
                                 </button>
                              </div>
                           </SwipeActionRow>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         <div className="mt-10 px-2">
            <h3
               onClick={() => setView(ViewState.FINANCE)}
               className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
            >
               <Wallet size={14} className="text-emerald-400" /> Finance
            </h3>
            {finance.length === 0 ? (
               <div className="text-zinc-600 text-sm italic pl-2">No transactions tracked.</div>
            ) : (
               <div className="space-y-3">
                  {finance.slice(0, 3).map(f => {
                     const isPaid = f.isPaidThisMonth;
                     return (
                        <div key={f.id} className="rounded-3xl overflow-hidden">
                           <SwipeActionRow
                              onDelete={() => deleteFinanceItem(f.id)}
                              onEdit={() => {
                                 const newAmt = prompt("Update Amount", f.amount.toString());
                                 if (newAmt) updateFinanceItem(f.id, { amount: parseFloat(newAmt) });
                              }}
                           >
                              <div className={`bg-white p-5 rounded-3xl border transition-all flex items-center justify-between shadow-sm ${isPaid ? 'border-zinc-200 bg-zinc-50 opacity-75' : 'border-zinc-100'}`}>
                                 <div>
                                    <span className={`font-bold block transition-all ${isPaid ? 'text-zinc-400 line-through decoration-zinc-300 decoration-2' : 'text-zinc-800'}`}>
                                       {f.title}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Expense</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className={`font-mono font-bold text-lg ${isPaid ? 'text-zinc-400 line-through' : 'text-emerald-500'}`}>${f.amount}</span>
                                    {f.type === 'bill' && (
                                       <button
                                          onClick={(e) => { e.stopPropagation(); togglePaid(f.id); }}
                                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPaid ? 'bg-zinc-200 text-zinc-500 hover:bg-rose-500 hover:text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-emerald-500 hover:text-white'}`}
                                       >
                                          {isPaid ? <RotateCcw size={14} /> : <Check size={14} />}
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </SwipeActionRow>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>



         {
            showOverdueModal && (
               <ReschedulePrompt
                  overdueTasks={overdueTasks}
                  onReschedule={handleBulkMoveToToday}
                  onDismiss={() => setShowOverdueModal(false)}
               />
            )
         }
      </div >
   );
};
