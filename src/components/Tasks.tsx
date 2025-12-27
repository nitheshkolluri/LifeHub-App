import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { Task, Priority } from '../types';
import { Trash2, Check, Plus, Calendar, Clock, X, Zap, Circle, Filter, Sparkles, Layers, List, ChevronRight } from 'lucide-react';

export const Tasks = () => {
  const { tasks, toggleTask, deleteTask, addTask, updateTask, editingTaskId, setEditingTaskId } = useApp();
  const { incrementUsage } = useUsage();

  // Redirect to Edit from Dashboard
  React.useEffect(() => {
    if (editingTaskId) {
      const task = tasks.find(t => t.id === editingTaskId);
      if (task) {
        openEditModal(task);
      }
      setEditingTaskId(null);
    }
  }, [editingTaskId]);

  // New State: View Mode (Focus vs All)
  const [viewMode, setViewMode] = useState<'focus' | 'all' | 'completed'>('focus');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  // --- HELPER FUNCTIONS ---
  const getLocalToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const parseTimeInput = (input: string): { cleanTitle: string, parsedTime: string | null, parsedDate: string | null } => {
    let title = input;
    let time = null;
    let date = null;

    const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i;
    const timeMatch = title.match(timeRegex);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridian = timeMatch[3]?.trim().toLowerCase().replace(/\./g, '');
      if (meridian === 'pm' && hours < 12) hours += 12;
      if (meridian === 'am' && hours === 12) hours = 0;
      time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      title = title.replace(timeRegex, '').trim();
    }

    const dateRegex = /\bon\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i;
    const dateMatch = title.match(dateRegex);
    if (dateMatch) {
      const parts = dateMatch[1].split(/[-/]/);
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        date = `${y}-${m}-${d}`;
        title = title.replace(dateMatch[0], '').trim();
      }
    } else {
      if (/\btoday\b/i.test(title)) {
        date = getLocalToday();
        title = title.replace(/\btoday\b/i, '').trim();
      } else if (/\btomorrow\b/i.test(title)) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const offset = d.getTimezoneOffset() * 60000;
        date = new Date(d.getTime() - offset).toISOString().split('T')[0];
        title = title.replace(/\btomorrow\b/i, '').trim();
      }
    }
    return { cleanTitle: title, parsedTime: time, parsedDate: date };
  };

  // --- HANDLERS ---
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

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime || null
      });
      setIsModalOpen(false);
    } else {
      let finalTitle = title;
      let finalDate = dueDate;
      let finalTime = dueTime;
      // FIX: If we are in Focus mode, new tasks should be High Priority so they appear immediately.
      // Default to user selection, but if using Quick Input in Focus mode, upgrade to High.
      let finalPriority = priority;

      if (!isModalOpen) {
        if (viewMode === 'focus') finalPriority = 'high';
        const { cleanTitle, parsedTime, parsedDate } = parseTimeInput(title);
        finalTitle = cleanTitle;
        if (parsedTime) finalTime = parsedTime;
        if (parsedDate) finalDate = parsedDate;
        else if (finalTime) finalDate = getLocalToday();
      }

      incrementUsage();
      addTask(finalTitle, finalPriority, finalDate, finalTime);
      setTitle(''); setDueDate(''); setDueTime('');
    }
    if (isModalOpen) setIsModalOpen(false);
  };

  // --- FILTERING LOGIC ---
  const filteredTasks = useMemo(() => {
    if (viewMode === 'completed') {
      return tasks.filter(t => t.status === 'completed');
    }

    if (viewMode === 'focus') {
      // Focus: High priority OR Overdue OR Due Today
      const todayStr = new Date().toISOString().split('T')[0];
      return tasks.filter(t => {
        if (t.status === 'completed') return false;
        const isHigh = t.priority === 'high';
        const isOverdue = t.dueDate && t.dueDate < todayStr;
        const isDueToday = t.dueDate === todayStr;
        return isHigh || isOverdue || isDueToday;
      });
    }

    // All: Everything pending
    return tasks.filter(t => t.status !== 'completed');
  }, [tasks, viewMode]);

  // --- GROUPING LOGIC ---
  const groupedTasks = useMemo(() => {
    const today = getLocalToday();
    const d = new Date(); d.setDate(d.getDate() + 1);
    const offset = d.getTimezoneOffset() * 60000;
    const tomorrow = new Date(d.getTime() - offset).toISOString().split('T')[0];

    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      upcoming: [] as Task[],
      someday: [] as Task[]
    };

    filteredTasks.forEach(task => {
      if (!task.dueDate) {
        groups.someday.push(task);
      } else if (task.dueDate < today) {
        groups.overdue.push(task);
      } else if (task.dueDate === today) {
        groups.today.push(task);
      } else if (task.dueDate === tomorrow) {
        groups.tomorrow.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    // ... sortFn ...
    const sortFn = (a: Task, b: Task) => {
      // High priority first
      const pMap = { high: 3, medium: 2, low: 1 };
      if (pMap[a.priority] !== pMap[b.priority]) return pMap[b.priority] - pMap[a.priority];
      return 0;
    };

    return {
      overdue: groups.overdue.sort(sortFn),
      today: groups.today.sort(sortFn),
      tomorrow: groups.tomorrow.sort(sortFn),
      upcoming: groups.upcoming.sort(sortFn),
      someday: groups.someday.sort(sortFn)
    };
  }, [filteredTasks]);

  // Section Component
  const TaskSection = ({ title, tasks, defaultOpen = false, color = "text-zinc-900" }: { title: string, tasks: Task[], defaultOpen?: boolean, color?: string }) => {
    // ... kept same ...
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (tasks.length === 0) return null;

    return (
      <div className="mb-6 animate-in-fade">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 mb-3 w-full text-left group"
        >
          <div className={`p-1 rounded-lg hover:bg-zinc-100 transition-colors ${isOpen ? 'rotate-90' : ''}`}>
            <ChevronRight size={16} className="text-zinc-400" />
          </div>
          <h3 className={`text-sm font-black uppercase tracking-widest ${color}`}>{title}</h3>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{tasks.length}</span>
          <div className="flex-1 h-px bg-zinc-100 ml-4 hidden group-hover:block transition-all" />
        </button>

        {isOpen && (
          <div className="space-y-3 pl-2 md:pl-0">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`group relative bg-white border border-zinc-100 p-4 md:p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 rounded-[1.5rem] transition-all cursor-pointer animate-slide-up flex items-center gap-4 ${task.status === 'completed' ? 'opacity-40 grayscale' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => openEditModal(task)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="absolute top-4 right-4 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>

                {/* CHECKBOX */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                    : 'border-zinc-200 hover:border-indigo-400 bg-zinc-50'
                    }`}
                >
                  <Check size={14} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                </button>

                <div className="flex-1 min-w-0 pr-8">
                  <h3 className={`text-base font-bold truncate leading-snug ${task.status === 'completed' ? 'line-through text-zinc-400 decoration-zinc-300' : 'text-zinc-800 group-hover:text-indigo-900 transition-colors'}`}>
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {task.priority && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${task.priority === 'high' ? 'bg-rose-50 text-rose-500' :
                        task.priority === 'medium' ? 'bg-indigo-50 text-indigo-500' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                        {task.priority}
                      </span>
                    )}
                    {task.dueTime && (
                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                        <Clock size={10} />
                        {task.dueTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen pb-32 pt-6 px-2 relative font-sans animate-in-fade">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-4 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-zinc-900 tracking-tight mb-2">My Tasks</h1>
          <p className="text-zinc-500 font-medium">Capture ideas, plan your day.</p>
        </div>

        {/* --- SMART TABS --- */}
        <div className="flex bg-white p-1.5 rounded-[1.2rem] self-start border border-zinc-100 shadow-sm">
          <button
            onClick={() => setViewMode('focus')}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${viewMode === 'focus' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
          >
            <Sparkles size={14} /> Focus
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${viewMode === 'all' ? 'bg-zinc-100 text-zinc-900 shadow-inner' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
          >
            <Layers size={14} /> All
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${viewMode === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
          >
            <Check size={14} /> Done
          </button>
        </div>
      </div>

      {/* --- QUICK INPUT --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 px-2">
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder={viewMode === 'focus' ? "Add a critical task..." : "Add a new task..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full atelier-input pl-14 shadow-sm group-hover:shadow-md transition-all rounded-[1.5rem] bg-white text-zinc-900 placeholder:text-zinc-400 border border-zinc-100 focus:border-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          <button
            onClick={handleSubmit}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-600 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="px-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-200 rounded-[2rem] bg-white/50">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100 ${viewMode === 'focus' ? 'bg-indigo-50 text-indigo-500' : 'bg-zinc-50 text-zinc-400'}`}>
              {viewMode === 'focus' ? <Sparkles size={32} /> : <Zap size={32} />}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              {viewMode === 'focus' ? 'No urgent tasks!' : 'All caught up!'}
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              {viewMode === 'focus' ? 'Switch to "All" to see the rest of your list.' : 'Enjoy your free time.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'completed' ? (
              <TaskSection title="Completed" tasks={filteredTasks} defaultOpen={true} color="text-emerald-500" />
            ) : (
              <>
                <TaskSection title="Overdue" tasks={groupedTasks.overdue} defaultOpen={true} color="text-rose-600" />
                <TaskSection title="Today" tasks={groupedTasks.today} defaultOpen={true} color="text-indigo-500" />
                <TaskSection title="Tomorrow" tasks={groupedTasks.tomorrow} defaultOpen={false} color="text-amber-500" />
                <TaskSection title="Upcoming" tasks={groupedTasks.upcoming} defaultOpen={false} color="text-zinc-400" />
                <TaskSection title="Someday / No Date" tasks={groupedTasks.someday} defaultOpen={false} color="text-zinc-300" />
              </>
            )}
          </>
        )}
      </div>

      {/* --- FLOATING ACTION BUTTON --- */}
      <button
        onClick={openAddModal}
        className="fixed right-6 bottom-24 md:bottom-10 md:right-10 w-14 h-14 bg-indigo-600 rounded-[1.2rem] text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all z-40 group border border-white/10"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm animate-in-fade p-4">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in-up border border-zinc-100">

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-black text-zinc-900 tracking-tight">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full py-4 bg-transparent border-b-2 border-zinc-100 text-xl font-bold text-zinc-900 focus:border-indigo-500 focus:outline-none placeholder:text-zinc-300 transition-colors"
                  placeholder="Task title..."
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Deadline</label>
                  <div className="bg-zinc-50 rounded-2xl p-3 flex items-center transition-colors hover:bg-zinc-100 border border-zinc-100">
                    <Calendar size={18} className="text-zinc-400 mr-2" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-zinc-700 w-full p-0 outline-none"
                    />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Time</label>
                  <div className="bg-zinc-50 rounded-2xl p-3 flex items-center transition-colors hover:bg-zinc-100 border border-zinc-100">
                    <input
                      type="time"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-zinc-700 w-full text-center p-0 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 block">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border flex flex-col items-center gap-1.5 ${priority === p
                        ? p === 'high' ? 'border-rose-500/50 bg-rose-50 text-rose-500 shadow-md' : p === 'medium' ? 'border-indigo-500/50 bg-indigo-50 text-indigo-500 shadow-md' : 'border-emerald-500/50 bg-emerald-50 text-emerald-500 shadow-md'
                        : 'border-zinc-100 bg-white text-zinc-400 hover:bg-zinc-50'
                        }`}
                    >
                      <Circle size={8} fill={priority === p ? "currentColor" : "transparent"} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-10 bg-indigo-600 text-white py-4 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.98] transition-all">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
