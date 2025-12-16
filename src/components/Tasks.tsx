
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

  // --- NLP Utilities ---
  const parseTimeInput = (input: string): { cleanTitle: string, parsedTime: string | null, parsedDate: string | null } => {
    let title = input;
    let time = null;
    let date = null;

    // 1. Extract Time (at HH:MM AM/PM)
    // Supported: 11:00am, 11:00 am, 11am, 11 am, 11:17AM
    const timeRegex = /\bat\s+(\d{1,2})(:(\d{2}))?(\s*(am|pm|a\.m\.|p\.m\.))?\b/i;
    const timeMatch = title.match(timeRegex);

    if (timeMatch) {
      // Convert to 24h
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
      const meridian = timeMatch[4]?.trim().toLowerCase().replace(/\./g, '');

      if (meridian === 'pm' && hours < 12) hours += 12;
      if (meridian === 'am' && hours === 12) hours = 0;

      time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      title = title.replace(timeRegex, '').trim(); // Use regex in replace to ensure exact match removal
    }

    // 2. Extract Date (on DD/MM/YYYY or today/tomorrow)
    const dateRegex = /\bon\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i;
    const dateMatch = title.match(dateRegex);
    if (dateMatch) {
      // Naive parse, assume user matches regional format. For now, ISO or simple logic.
      // Let's rely on standard ISO for storage if possible, or Keep regex simple.
      // Actually, if we want reliable dates, we should standardized to YYYY-MM-DD.
      // Since this is a simple strict implementation:
      // Attempt to parse:
      const parts = dateMatch[1].split(/[-/]/);
      // Assume DD/MM/YYYY
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        date = `${y}-${m}-${d}`;
        title = title.replace(dateMatch[0], '').trim();
      }
    } else {
      if (/\btoday\b/i.test(title)) {
        date = new Date().toISOString().split('T')[0];
        title = title.replace(/\btoday\b/i, '').trim();
      } else if (/\btomorrow\b/i.test(title)) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        date = d.toISOString().split('T')[0];
        title = title.replace(/\btomorrow\b/i, '').trim();
      }
    }

    return { cleanTitle: title, parsedTime: time, parsedDate: date };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime || null
      });
      setIsModalOpen(false);
    } else {
      // Logic for NEW Tasks (Inline or Modal)
      // Check if this came from Inline Input (we can guess if modal is closed, but safely parsing always helps)

      let finalTitle = title;
      let finalDate = dueDate;
      let finalTime = dueTime;

      // Only run Parser if user didn't explicitly set date/time in Modal (assume form overrides NLP)
      if (!isModalOpen) {
        const { cleanTitle, parsedTime, parsedDate } = parseTimeInput(title);
        finalTitle = cleanTitle;
        if (parsedTime) finalTime = parsedTime;

        if (parsedDate) {
          finalDate = parsedDate;
        } else if (finalTime) {
          // User mentioned time but no date.
          // Prompt user to default to Today?
          if (window.confirm("You scheduled a time but no date. Set for TODAY?")) {
            finalDate = new Date().toISOString().split('T')[0];
          }
        }
      }

      // Usage Logic (Removed Paywall)
      incrementUsage();

      addTask(finalTitle, priority, finalDate, finalTime);

      // CRITICAL FIX: Clear the title after submission!
      setTitle('');
      setDueDate('');
      setDueTime('');
    }

    // Check if we need to close modal
    if (isModalOpen) setIsModalOpen(false);
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

      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title} // Assuming 'title' is the new task input
            onChange={(e) => setTitle(e.target.value)}
            className="w-full glass-input text-lg pl-12 transition-all group-hover:bg-white/60"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} // Assuming handleSubmit handles adding
          />
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-hover:text-indigo-600 transition-colors" size={24} />
        </div>
        <button
          onClick={openAddModal} // Changed to openAddModal
          className="btn-primary whitespace-nowrap"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? ( // Removed loading state, assuming tasks is always available
          <div className="glass-card text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
              <Zap size={40} /> {/* Changed to Zap icon */}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your mind is clear. Use the input above to capture new tasks or ask the Assistant to help you plan.
            </p>
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <div
              key={task.id}
              className="glass-card group relative p-6 hover:border-indigo-200 animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => openEditModal(task)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors p-2"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all checkbox-spring ${task.status === 'completed'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500'
                    : 'border-slate-200 hover:border-indigo-300'
                    }`}
                >
                  {task.status === 'completed' && <Check size={16} className="text-white" strokeWidth={3} />}
                </button>

                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {task.priority && (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                        task.priority === 'medium' ? 'bg-indigo-100 text-indigo-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                        {task.priority}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {task.dueDate}
                      </span>
                    )}
                    {task.dueTime && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {task.dueTime}
                      </span>
                    )}
                  </div>
                </div>
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
