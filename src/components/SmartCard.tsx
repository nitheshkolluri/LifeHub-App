import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Calendar, Trash2, CheckCircle } from 'lucide-react';

interface SmartCardProps {
    title: string;
    subtitle?: string | React.ReactNode;
    icon?: React.ReactNode;
    color?: string; // Tailwind text class
    isCompleted?: boolean;
    priority?: 'high' | 'medium' | 'low'; // New Prop
    isOverdue?: boolean; // New Prop
    onToggle?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    onReschedule?: () => void; // New Prop
}

export const SmartCard: React.FC<SmartCardProps> = ({
    title, subtitle, icon, color = 'text-ink', isCompleted, priority, isOverdue, onToggle, onDelete, onEdit, onReschedule
}) => {
    const [showMenu, setShowMenu] = useState(false);

    // Helpers
    const stopAndRun = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        action && action();
    };

    // Style Logic
    const priorityColor = priority === 'high' ? 'border-l-rose-500' : priority === 'medium' ? 'border-l-amber-400' : 'border-l-transparent';
    const overdueClass = isOverdue && !isCompleted ? 'ring-2 ring-amber-100 animate-pulse-slow' : '';
    const borderClass = priority && !isCompleted ? `border-l-4 ${priorityColor}` : '';

    return (
        <div className={`relative group bg-white border border-slate-100 p-3 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all cursor-default ${borderClass} ${overdueClass}`}>
            <div className="flex justify-between items-start gap-3">

                {/* 1. CHECKBOX ZONE */}
                <div className="pt-1 cursor-pointer" onClick={(e) => stopAndRun(e, onToggle)}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isCompleted
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'border-slate-300 text-transparent hover:border-indigo-500'
                        }`}>
                        <CheckCircle size={12} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                    </div>
                </div>

                {/* 2. CONTENT ZONE */}
                <div className="flex-1 cursor-pointer" onClick={(e) => stopAndRun(e, onEdit)}>
                    <div className="flex items-center gap-2">
                        <h4 className={`font-medium leading-snug text-base ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {title}
                        </h4>
                        {/* Priority Badge (Icon) */}
                        {priority === 'high' && !isCompleted && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                        {icon && <span className={`${color}`}>{icon}</span>}
                    </div>
                    {subtitle && (
                        <div className={`text-xs mt-1 font-mono flex items-center gap-1 ${isCompleted ? 'text-slate-500' : 'text-slate-500'}`}>
                            {isOverdue && !isCompleted && <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Overdue • </span>}
                            {subtitle}
                        </div>
                    )}
                </div>

                {/* 3. ACTIONS ZONE (REMOVED) */}
            </div>
        </div>
    );
};
