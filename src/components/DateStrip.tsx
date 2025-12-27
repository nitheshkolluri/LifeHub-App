import React from 'react';
import { format, addDays, isSameDay, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onSelectDate }) => {

    const handlePrev = () => onSelectDate(subDays(selectedDate, 1));
    const handleNext = () => onSelectDate(addDays(selectedDate, 1));
    const isToday = isSameDay(selectedDate, new Date());

    return (
        <div className="w-full flex items-center justify-between bg-white rounded-full p-2 border border-zinc-200 mb-6 shadow-sm">
            <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors active:scale-95"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {isToday ? 'Today' : format(selectedDate, 'EEEE')}
                </span>
                <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Calendar size={14} className="text-rose-400" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                </span>
            </div>

            <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors active:scale-95"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};
