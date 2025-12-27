
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Flame, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';
import { Habit } from '../types';

export const Habits = () => {
  const { habits, addHabit, incrementHabit, deleteHabit, triggerConfetti } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const handleIncrement = (id: string, streak: number) => {
    incrementHabit(id);
    // Celebration Logic: Trigger confetti if streak hits a multiple of 7
    if ((streak + 1) % 7 === 0) {
      triggerConfetti();
    }
  };

  const getHeatmapDays = (habit: Habit) => {
    // Generate last 7 days for visualization
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      days.push({ date: iso, completed: habit.completedDates.includes(iso) });
    }
    return days;
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitTitle.trim()) {
      addHabit(newHabitTitle);
      setNewHabitTitle('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 animate-in-fade font-sans">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-black text-zinc-900 tracking-tight mb-2">Rituals</h1>
          <p className="text-zinc-500 font-medium">Build momentum, one day at a time.</p>
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit, index) => {
          const today = new Date().toISOString().split('T')[0];
          const isDoneToday = habit.completedDates.includes(today);

          return (
            <div
              key={habit.id}
              className="atelier-card p-6 relative group border border-zinc-100 bg-white hover:scale-[1.02] transition-transform duration-300 rounded-[2rem] hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 shadow-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 mb-1 group-hover:text-indigo-600 transition-colors">{habit.title}</h3>
                  <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm">
                    <Flame size={16} className={habit.streak > 0 ? "fill-orange-500 animate-pulse" : "text-zinc-300"} />
                    <span>{habit.streak} Day Streak</span>
                  </div>
                </div>
                <button
                  onClick={() => handleIncrement(habit.id, habit.streak)}
                  disabled={isDoneToday}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isDoneToday
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30' // Done state needs to pop
                    : 'bg-zinc-50 text-zinc-400 hover:bg-emerald-500 hover:text-white hover:scale-110 shadow-sm border border-zinc-100'
                    }`}
                >
                  <CheckCircle size={24} className={isDoneToday ? "scale-110" : ""} />
                </button>
              </div>

              {/* Heatmap */}
              <div className="flex justify-between items-end gap-1">
                {getHeatmapDays(habit).map((day, i) => (
                  <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${day.completed
                        ? 'bg-emerald-400 h-8 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                        : 'bg-zinc-100 h-2'
                        }`}
                    />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* --- ADD CARD --- */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-zinc-200 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[180px]"
        >
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-zinc-100 group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-bold">New Ritual</span>
        </button>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in-fade">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleAddHabit} className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl animate-in-up border border-zinc-100">
            <h2 className="text-2xl font-black text-zinc-900 mb-6">New Habit</h2>
            <input
              autoFocus
              placeholder="Drink Water..."
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              className="w-full text-xl font-bold border-b-2 border-zinc-100 py-2 mb-8 focus:outline-none focus:border-indigo-500 bg-transparent text-zinc-900 placeholder:text-zinc-300"
            />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform">
              Start Streak
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
