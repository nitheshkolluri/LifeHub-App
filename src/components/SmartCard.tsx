
import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Calendar, Trash2, CheckCircle, Check } from 'lucide-react';

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
    title, subtitle, icon, color = 'text-neutral-900', isCompleted, priority, isOverdue, onToggle, onDelete, onEdit, onReschedule
}) => {
    // Helpers
    const stopAndRun = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        action && action();
    };

    // Style Logic
    // Soft Priority Indicators
    const priorityColor = priority === 'high' ? 'bg-rose-500' : priority === 'medium' ? 'bg-amber-400' : 'bg-transparent';
    const overdueClass = isOverdue && !isCompleted ? 'ring-1 ring-amber-100 bg-amber-50/30' : '';

    return (
        <div className={`relative group bg-white border border-neutral-100 p-4 rounded-3xl transition-all cursor-default ${overdueClass} shadow-card hover:shadow-soft hover:border-neutral-200 active:scale-[0.99] duration-300`}>

            {/* Priority Dot */}
            {priority && !isCompleted && (
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full opacity-20 ${priority === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`} />
            )}

            <div className="flex justify-between items-center gap-4 pl-2">

                {/* 1. CHECKBOX ZONE */}
                <div className="cursor-pointer group/check" onClick={(e) => stopAndRun(e, onToggle)}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isCompleted
                        ? 'bg-neutral-900 border-neutral-900 text-white scale-110 shadow-sm'
                        : 'border-neutral-200 text-transparent hover:border-indigo-400 bg-neutral-50'
                        }`}>
                        <Check size={14} strokeWidth={3} className={isCompleted ? 'scale-100' : 'scale-0'} />
                    </div>
                </div>

                {/* 2. CONTENT ZONE */}
                <div className="flex-1 min-w-0 cursor-pointer py-1" onClick={(e) => stopAndRun(e, onEdit)}>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-bold leading-tight text-[15px] truncate pr-2 ${isCompleted ? 'text-neutral-400 line-through decoration-neutral-300' : 'text-neutral-800'}`}>
                            {title}
                        </h4>
                        {/* Priority Badge (Visual) */}
                        {priority === 'high' && !isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    </div>

                    {(subtitle || icon) && (
                        <div className="flex items-center gap-2">
                            {icon && <span className={`${color} opacity-90 scale-90`}>{icon}</span>}
                            {subtitle && (
                                <div className={`text-xs font-medium flex items-center gap-1.5 ${isCompleted ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                    {isOverdue && !isCompleted && (
                                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase">Overdue</span>
                                    )}
                                    <span className="tracking-wide truncate">{subtitle}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
