import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Calendar, ArrowRight, CheckSquare, X, Sun } from 'lucide-react';

interface ReschedulePromptProps {
    overdueTasks: Task[];
    onReschedule: (taskIds: string[]) => void;
    onDismiss: () => void;
}

export const ReschedulePrompt: React.FC<ReschedulePromptProps> = ({ overdueTasks, onReschedule, onDismiss }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Select all by default on mount
    useEffect(() => {
        setSelectedIds(overdueTasks.map(t => t.id));
    }, [overdueTasks]);

    const toggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(pid => pid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleConfirm = () => {
        onReschedule(selectedIds);
    };

    if (overdueTasks.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Sun size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Morning Briefing</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Fresh Start?</h3>
                        <p className="text-slate-500 text-sm mt-1">You have {overdueTasks.length} incomplete items from yesterday.</p>
                    </div>
                    <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                    {overdueTasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => toggle(task.id)}
                            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${selectedIds.includes(task.id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                        >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${selectedIds.includes(task.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                {selectedIds.includes(task.id) && <CheckSquare size={14} />}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold text-sm ${selectedIds.includes(task.id) ? 'text-indigo-900' : 'text-slate-500'}`}>{task.title}</p>
                                {task.dueDate && <p className="text-xs text-slate-400">Was due {task.dueDate}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={onDismiss} className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors text-sm">
                        Dismiss
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <span>Move {selectedIds.length} to Today</span>
                        <ArrowRight size={16} />
                    </button>
                </div>

            </div>
        </div>
    );
};
