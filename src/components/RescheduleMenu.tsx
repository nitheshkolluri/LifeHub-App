import React, { useState } from 'react';
import { Calendar, Sun, Moon, ArrowRight, X } from 'lucide-react';

interface RescheduleMenuProps {
    onSelectDate: (dateStr: string) => void;
    onClose: () => void;
}

export const RescheduleMenu: React.FC<RescheduleMenuProps> = ({ onSelectDate, onClose }) => {
    // Helpers
    const getToday = () => new Date().toISOString().split('T')[0];
    const getTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            onSelectDate(e.target.value);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-600" /> Reschedule Task
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 font-bold"><X size={18} /></button>
                </div>

                <div className="p-2 space-y-1">
                    <button
                        onClick={() => { onSelectDate(getToday()); onClose(); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl text-left transition-colors group"
                    >
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200"><Sun size={18} /></div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Today</p>
                            <p className="text-xs text-slate-400">Move to current active view</p>
                        </div>
                    </button>

                    <button
                        onClick={() => { onSelectDate(getTomorrow()); onClose(); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-amber-50 rounded-xl text-left transition-colors group"
                    >
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-200"><Moon size={18} /></div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Tomorrow</p>
                            <p className="text-xs text-slate-400">Push to next day</p>
                        </div>
                    </button>

                    <div className="relative w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors group cursor-pointer">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-200"><Calendar size={18} /></div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm">Pick Date</p>
                            <p className="text-xs text-slate-400">Select specific day</p>
                        </div>
                        <div className="absolute inset-0 opacity-0">
                            <input
                                type="date"
                                className="w-full h-full cursor-pointer"
                                onChange={handleDateInput}
                            />
                        </div>
                        <ArrowRight size={16} className="text-slate-300" />
                    </div>
                </div>
            </div>
        </div>
    );
};
