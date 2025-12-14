
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { Task, Priority } from '../types';
import { Trash2, Check, Plus, Calendar, Clock, X, Zap, Circle } from 'lucide-react';

// --- STYLES ---
const taskStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  .task-card {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .task-card:active {
    transform: scale(0.96);
  }
  .priority-glow-high { box-shadow: 0 0 20px -5px rgba(244, 63, 94, 0.4); }
  .priority-glow-medium { box-shadow: 0 0 20px -5px rgba(99, 102, 241, 0.3); }
  
  .checkbox-spring:active { transform: scale(0.8); }
`;

export const Tasks = () => {
  const { tasks, toggleTask, deleteTask, addTask, updateTask } = useApp();
  const { usageCount, isPremium, setShowPaywall, incrementUsage } = useUsage();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return t.status !== 'completed'; // Default to active focus
    return t.status === filter;
  });

  // Sort by priority and date
  const sortedTasks = filteredTasks.sort((a, b) => {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    return priorityScore[b.priority] - priorityScore[a.priority];
  });

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setDueTime('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate || '');
    setDueTime(task.dueTime || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!editingTask) {
      // Enforce Usage Limit on New Tasks
      if (!isPremium && usageCount >= 3) {
        setShowPaywall(true);
        return;
      }
      incrementUsage();
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime || null
      });
    } else {
      addTask(title, priority, dueDate, dueTime);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-2 relative font-sans">
      <style>{taskStyles}</style>

      {/* --- HEADER --- */}
      <div className="flex flex-col items-start mb-8 px-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-1">Flow State</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{filteredTasks.length} Active Items</span>

          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/50">
            {(['all', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 text-[10px] font-bold rounded-full uppercase transition-all ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {f === 'all' ? 'Focus' : 'Done'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- TASK STREAM --- */}
      <div className="space-y-4 px-2">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-60">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
              <Zap className="text-indigo-200" size={40} />
            </div>
            <p className="text-slate-500 font-medium text-lg">Your mind is clear.</p>
            <button onClick={openAddModal} className="mt-4 text-indigo-500 text-sm font-bold">Create new flow</button>
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <div
              key={task.id}
              onClick={() => openEditModal(task)}
              className={`task-card group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white p-5 rounded-[24px] cursor-pointer
                ${task.priority === 'high' ? 'priority-glow-high border-rose-100/50' :
                  task.priority === 'medium' ? 'priority-glow-medium border-indigo-100/50' : 'shadow-sm border-slate-100'}
              `}
              style={{ animation: `float-${index % 2 === 0 ? 'slow' : 'medium'} ${3 + index}s ease-in-out infinite` }}
            >
              {/* Decorative Gradient Blob for High Priority */}
              {task.priority === 'high' && (
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-400/20 blur-[40px] rounded-full pointer-events-none" />
              )}

              <div className="flex items-start gap-4 relative z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                  className={`checkbox-spring w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all duration-300
                      ${task.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 scale-90'
                      : 'border-slate-200 hover:border-indigo-400 bg-white/80'}`}
                >
                  <Check size={16} className={`text-white transition-opacity ${task.status === 'completed' ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
                </button>

                <div className="flex-1 pt-1">
                  <h3 className={`text-lg font-bold leading-snug transition-all ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 mt-2">
                    {task.priority === 'high' && (
                      <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md tracking-wider uppercase">
                        Urgent
                      </span>
                    )}
                    {(task.dueDate || task.dueTime) && (
                      <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock size={10} className="mr-1.5" />
                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        {task.dueTime && <span className="ml-1 opacity-70">{task.dueTime}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- FLOATING ACTION BUTTON --- */}
      <button
        onClick={openAddModal}
        className="fixed right-6 bottom-24 md:bottom-10 md:right-10 w-16 h-16 bg-slate-900 rounded-[24px] text-white shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSubmit} className="relative w-full md:max-w-md bg-white md:rounded-[40px] rounded-t-[40px] p-8 shadow-2xl animate-slide-up">

            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 md:hidden" />

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingTask ? 'Edit Flow' : 'New Flow'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full py-4 bg-transparent border-b-2 border-slate-100 text-2xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none placeholder:text-slate-300 transition-colors"
                  placeholder="What's the focus?"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Deadline</label>
                  <div className="bg-slate-50 rounded-2xl p-2 flex items-center">
                    <Calendar size={18} className="text-slate-400 ml-2" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-full"
                    />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Time</label>
                  <div className="bg-slate-50 rounded-2xl p-2 flex items-center">
                    <input
                      type="time"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-full text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">Energy Level</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase transition-all border-2 flex flex-col items-center gap-2 ${priority === p
                          ? p === 'high' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-200' : p === 'medium' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-200' : 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-200'
                          : 'border-slate-100 bg-white text-slate-300 hover:border-slate-200'
                        }`}
                    >
                      <Circle size={10} fill={priority === p ? "currentColor" : "transparent"} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-10 bg-slate-900 text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all">
              {editingTask ? 'Update Flow' : 'Add to Stream'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
