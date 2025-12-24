
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Habit } from '../types';
import { Flame, Plus, Check, Star, Sparkles, X, Trash2 } from 'lucide-react';

const ConstellationNode = ({ active }: { active: boolean }) => (
  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${active
    ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110'
    : 'bg-slate-200 scale-100'
    }`} />
);

const HabitCard = ({ habit, onIncrement, deleteHabit, isDoneToday }: any) => {
  return (
    <div className="group relative glass-card p-6 rounded-[32px] hover:bg-white/60 overflow-hidden">

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
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-slate-200 hover:text-rose-500 hover:scale-110 shadow-lg transition-all"
          >
            <Trash2 size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onIncrement(habit.id); }}
            disabled={isDoneToday}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isDoneToday
              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white scale-100'
              : 'bg-white text-slate-200 hover:text-primary-500 hover:scale-110'
              }`}
          >
            {isDoneToday ? <Star size={24} fill="currentColor" /> : <Check size={24} strokeWidth={4} />}
          </button>
        </div>
      </div>

      {/* Mini Constellation Visualization (Last 7 Days) */}
      <div className="mt-8 flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-10" />

        {[...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          const done = habit.completedDates.includes(dateStr);

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <ConstellationNode active={done} />
              <span className="text-[9px] font-bold text-slate-300 uppercase">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Habits = () => {
  const { habits, addHabit, updateHabit, incrementHabit, deleteHabit } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
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
    <div className="min-h-screen pb-32 pt-6 px-2 font-sans">

      <div className="flex flex-col items-start mb-8 px-4">
        <h1 className="text-4xl font-black text-emerald-900 tracking-tighter mb-1">Rituals</h1>
        <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Build your constellation</p>
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
