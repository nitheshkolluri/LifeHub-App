import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Calendar, Trash2, CheckCircle } from 'lucide-react';

interface SmartCardProps {
    title: string;
    subtitle?: string | React.ReactNode;
    icon?: React.ReactNode;
    color?: string; // Tailwind text class
    isCompleted?: boolean;
    onToggle?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

export const SmartCard: React.FC<SmartCardProps> = ({
    title, subtitle, icon, color = 'text-ink', isCompleted, onToggle, onDelete, onEdit
}) => {
    const [showMenu, setShowMenu] = useState(false);

    // Helper to preventing bubbling
    const stopAndRun = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        action && action();
    };

    return (
        <div className="relative group bg-white border border-slate-100 p-3 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all cursor-default">
            <div className="flex justify-between items-start gap-3">

                {/* 1. CHECKBOX ZONE (Toggle Only) */}
                <div className="pt-1 cursor-pointer" onClick={(e) => stopAndRun(e, onToggle)}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isCompleted
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'border-slate-300 text-transparent hover:border-indigo-500'
                        }`}>
                        <CheckCircle size={12} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                    </div>
                </div>

                {/* 2. CONTENT ZONE (Edit or details, NOT Toggle) */}
                <div className="flex-1 cursor-pointer" onClick={(e) => stopAndRun(e, onEdit)}>
                    <div className="flex items-center gap-2">
                        <h4 className={`font-medium leading-snug text-base ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {title}
                        </h4>
                        {icon && <span className={`${color}`}>{icon}</span>}
                    </div>
                    {subtitle && <div className={`text-xs mt-1 font-mono ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</div>}
                </div>

                {/* 3. ACTIONS ZONE */}
                <div className="relative flex items-center gap-1">
                    <button
                        onClick={(e) => stopAndRun(e, () => setShowMenu(!showMenu))}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => stopAndRun(e, () => setShowMenu(false))} />
                            <div className="absolute right-0 top-8 w-36 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                                <button onClick={(e) => stopAndRun(e, () => { onEdit?.(); setShowMenu(false); })} className="text-left px-3 py-2.5 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button onClick={(e) => stopAndRun(e, () => { console.log('Reschedule'); setShowMenu(false); })} className="text-left px-3 py-2.5 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                    <Calendar size={12} /> Reschedule
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button onClick={(e) => stopAndRun(e, () => { onDelete?.(); setShowMenu(false); })} className="text-left px-3 py-2.5 text-xs text-rose-500 hover:bg-rose-50 flex items-center gap-2">
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
