import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Habit } from '../types';
import { Flame, Plus, Check, Star, Sparkles, X, Trash2, Calendar, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays } from 'lucide-react';

// --- SUB-COMPONENT: CALENDAR VIEW ---
const CalendarVisualizer = ({ habit, view }: { habit: Habit, view: 'week' | 'month' }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Helper: Get days for Week View (Mon-Sun for current week)
  const weekDays = useMemo(() => {
    const arr = [];
    const currentDay = today.getDay(); // 0 is Sunday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate offset to Monday

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);

    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  // Helper: Get days for Month View
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(new Date(currentYear, currentMonth, i));
    }
    return arr;
  }, [currentMonth, currentYear]);

  const isCompleted = (date: Date) => habit.completedDates.includes(date.toISOString().split('T')[0]);
  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  if (view === 'week') {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Week</span>
        </div>
        <div className="flex justify-between items-center relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-10" />

          {weekDays.map((d, i) => {
            const done = isCompleted(d);
            const todayHighlight = isToday(d);

            return (
              <div key={i} className="flex flex-col items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${done
                    ? 'bg-amber-400 border-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : todayHighlight
                      ? 'border-indigo-400 bg-white scale-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                  {done && <Check size={14} className="text-white" strokeWidth={4} />}
                </div>
                <span className={`text-[9px] font-bold uppercase ${todayHighlight ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // MONTH VIEW
  return (
    <div className="mt-6 mb-2">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-[8px] font-bold text-slate-300">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for start day (assuming standard month starts) */}
        {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }).map((_, i) => <div key={`pad-${i}`} />)}

        {monthDays.map((d, i) => {
          const done = isCompleted(d);
          const todayHighlight = isToday(d);
          return (
            <div key={i} className={`aspect-square flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${done
                ? 'bg-amber-400 text-white shadow-sm'
                : todayHighlight
                  ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                  : 'bg-slate-50 text-slate-300'
              }`}>
              {d.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  );
};

// --- HABIT CARD ---
const HabitCard = ({ habit, onIncrement, deleteHabit, isDoneToday, view }: any) => {
  return (
    <div className="group relative glass-card p-6 rounded-[32px] hover:bg-white/60 text-left transition-all duration-300 border border-transparent hover:border-slate-100">

      {/* Background Glow based on streak */}
      <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] transition-all duration-1000 ${habit.streak > 5 ? 'bg-amber-400/20' : 'bg-slate-200/20'
        }`} />

      <div className="relative z-10 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-800">{habit.title}</h3>
            {habit.streak > 0 && (
              <div className="flex items-center text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Flame size={10} className="mr-1" fill="currentColor" />
                {habit.streak} Day Streak
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{habit.frequency}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-slate-200 hover:text-rose-500 hover:scale-110 shadow-lg transition-all"
          >
            <Trash2 size={20} />
          </button>

          {/* Main Action Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onIncrement(habit.id); }}
            disabled={isDoneToday}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isDoneToday
              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white scale-100 cursor-default'
              : 'bg-white text-slate-200 hover:text-indigo-600 hover:scale-110 active:scale-95'
              }`}
          >
            {isDoneToday ? <Star size={24} fill="currentColor" className="animate-spin-slow" /> : <Check size={24} strokeWidth={4} />}
          </button>
        </div>
      </div>

      <CalendarVisualizer habit={habit} view={view} />
    </div>
  );
};

export const Habits = () => {
  const { habits, addHabit, updateHabit, incrementHabit, deleteHabit } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  // View Toggle State: 'week' | 'month'
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const today = new Date().toISOString().split('T')[0];

  const openAddModal = () => {
    setEditingHabit(null);
    setTitle('');
    setFrequency('daily');
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setTitle(habit.title);
    setFrequency(habit.frequency);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title) {
      if (editingHabit) {
        updateHabit(editingHabit.id, { title, frequency });
      } else {
        addHabit(title, frequency);
      }
      setIsModalOpen(false);
      setTitle('');
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-2 font-sans animate-in fade-in duration-300">

      <div className="flex flex-col items-start mb-8 px-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-4xl font-black text-emerald-900 tracking-tighter mb-1">Rituals</h1>
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Build your constellation</p>
          </div>

          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('week')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CalendarDays size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {habits.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Star className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-bold">No rituals yet.</p>
          </div>
        ) : (
          habits.map(habit => (
            <div key={habit.id} onClick={() => openEditModal(habit)} className="cursor-pointer">
              <HabitCard
                habit={habit}
                onIncrement={incrementHabit}
                deleteHabit={deleteHabit}
                isDoneToday={habit.completedDates.includes(today)}
                view={viewMode}
              />
            </div>
          ))
        )}

        <button
          onClick={openAddModal}
          className="mt-4 py-4 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-500 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add New Ritual</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSubmit} className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">{editingHabit ? 'Edit Ritual' : 'New Ritual'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-slate-500" /></button>
            </div>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Meditate"
              className="w-full py-4 bg-transparent border-b-2 border-slate-100 text-xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none mb-8"
              autoFocus
            />

            <div className="flex gap-2 mb-8">
              {(['daily', 'weekly'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase ${frequency === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold text-lg shadow-xl hover:bg-indigo-600 transition-all">
              {editingHabit ? 'Update Ritual' : 'Start Tracking'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
