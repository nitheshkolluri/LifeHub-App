
import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, Flame, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

// --- TYPES ---
interface FocusItem {
    id: string;
    type: 'task' | 'habit' | 'finance';
    title: string;
    subtitle?: string;
    priority?: 'high' | 'medium' | 'low';
    isOverdue?: boolean;
    date?: string;
}

interface FocusDeckProps {
    items: FocusItem[];
    onComplete: (id: string, type: string) => void;
    onDefer: (id: string, type: string) => void;
    onSkip: (id: string, type: string) => void;
}


// --- SUB-COMPONENT: CARD ---
interface CardProps {
    item: FocusItem;
    isTop: boolean;
    index: number;
    currentIndex: number;
    length: number;
    onComplete: (id: string, type: string) => void;
    onDefer: (id: string, type: string) => void;
}

// Defined outside to prevent re-renders
const Card: React.FC<CardProps> = ({ item, isTop, index, currentIndex, length, onComplete, onDefer }) => {
    const x = useMotionValue(0);
    const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);
    const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);
    const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);
    const [exitX, setExitX] = useState<number>(0);

    // Background Color shifts (Dark Mode: Subtle tinting)
    const bg = useTransform(x, [-150, 0, 150], [
        "rgba(88, 28, 135, 1)", // Purple/Rose (Defer/Skip) - dark tint
        "rgba(30, 41, 59, 1)",   // Slate-800 (Neutral)
        "rgba(6, 78, 59, 1)"     // Emerald-900 (Complete) - dark tint
    ]);

    const handleDragEnd = (_: any, info: any) => {
        if (!isTop) return;
        const threshold = 100;
        if (info.offset.x > threshold) {
            setExitX(200);
            setTimeout(() => {
                onComplete(item.id, item.type);
            }, 200);
        } else if (info.offset.x < -threshold) {
            setExitX(-200);
            setTimeout(() => {
                onDefer(item.id, item.type);
            }, 200);
        }
    };

    return (
        <motion.div
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                scale: isTop ? scale : 1 - (0.05 * (index - currentIndex)),
                backgroundColor: isTop ? bg : '#1e293b', // bg-slate-800
                zIndex: length - index,
                y: (index - currentIndex) * 10,
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{
                scale: isTop ? 1 : 0.95,
                opacity: 1 - ((index - currentIndex) * 0.3),
                y: (index - currentIndex) * 12,
                x: isTop && exitX !== 0 ? exitX : 0
            }}
            exit={{ x: exitX, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "absolute top-0 left-0 w-full h-full rounded-[2.5rem] p-8 border shadow-xl flex flex-col justify-between cursor-grab active:cursor-grabbing",
                isTop ? "shadow-2xl shadow-black/50 border-white/10" : "border-white/5 bg-slate-900/50"
            )}
        >
            {/* --- CARD HEADER --- */}
            <div className="flex justify-between items-start">
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    item.isOverdue ? "bg-amber-500/20 text-amber-400" :
                        item.priority === 'high' ? "bg-rose-500/20 text-rose-400" :
                            "bg-indigo-500/20 text-indigo-400"
                )}>
                    {item.type === 'task' ? <Check size={12} /> : item.type === 'habit' ? <Flame size={12} /> : <AlertCircle size={12} />}
                    <span>{item.isOverdue ? 'Overdue' : item.priority || 'Focus'}</span>
                </div>
            </div>

            {/* --- CARD CONTENT --- */}
            <div>
                <h2 className="text-3xl font-display font-black text-white leading-tight mb-2 line-clamp-3 drop-shadow-md">
                    {item.title}
                </h2>
                <div className="flex flex-wrap gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    {item.date && (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                            <Calendar size={12} /> {item.date}
                        </span>
                    )}
                    {item.subtitle && (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                            {item.subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* --- CARD ACTIONS INDICATORS --- */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
                <div className="flex items-center gap-1 group-hover:text-rose-400 transition-colors"><ArrowRight className="rotate-180" size={14} /> <span>Defer</span></div>
                <div className="flex items-center gap-1 group-hover:text-emerald-400 transition-colors"><span>Done</span> <ArrowRight size={14} /></div>
            </div>

            {/* --- DECORATIVE BLOBS --- */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
        </motion.div>
    );
};

export const FocusDeck: React.FC<FocusDeckProps> = React.memo(({ items, onComplete, onDefer, onSkip }) => {
    const [index, setIndex] = useState(0);

    const handleAction = (id: string, type: string, action: 'complete' | 'defer' | 'skip') => {
        if (action === 'complete') onComplete(id, type);
        else if (action === 'defer') onDefer(id, type);
        else onSkip(id, type);

        setIndex(prev => prev + 1);
    };

    const currentItem = items[index];

    // Card Stack Logic
    if (!currentItem) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/10 animate-in-fade shadow-inner">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center shadow-lg shadow-black/20 mb-4 border border-white/5">
                    <Check className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">No critical items remaining.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[360px] md:h-[400px] perspective-1000">
            <AnimatePresence>
                {items.slice(index, index + 3).reverse().map((item, i) => {
                    const originalIndex = index + (items.slice(index, index + 3).length - 1 - i);
                    return (
                        <Card
                            key={item.id}
                            item={item}
                            isTop={originalIndex === index}
                            index={originalIndex}
                            currentIndex={index}
                            length={items.length}
                            onComplete={(id, t) => handleAction(id, t, 'complete')}
                            onDefer={(id, t) => handleAction(id, t, 'defer')}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
});
