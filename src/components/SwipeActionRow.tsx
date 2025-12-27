
import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';

interface SwipeActionRowProps {
    children: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    onReschedule?: () => void;
    activationThreshold?: number; // Pixels to drag before snap
}

export const SwipeActionRow: React.FC<SwipeActionRowProps> = ({
    children,
    onEdit,
    onDelete,
    onReschedule,
    activationThreshold = 80
}) => {
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Unified pointers
    const startX = useRef<number | null>(null);
    const currentX = useRef<number | null>(null);
    const rowRef = useRef<HTMLDivElement>(null);

    // Calculate max reveal width based on available actions
    // Count actions provided
    const actions = [];
    if (onEdit) actions.push('edit');
    if (onReschedule) actions.push('reschedule');
    if (onDelete) actions.push('delete');

    const maxOffset = actions.length * 56 + 24; // Compact spacing

    // --- TOUCH HANDLERS ---
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        startX.current = e.touches[0].clientX;
        currentX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!startX.current) return;
        currentX.current = e.touches[0].clientX;
        updateOffset(currentX.current - startX.current);
    };

    // --- MOUSE HANDLERS (Desktop Drag Support) ---
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        startX.current = e.clientX;
        currentX.current = e.clientX;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || startX.current === null) return;
        e.preventDefault(); // Prevent text selection
        currentX.current = e.clientX;
        updateOffset(currentX.current - startX.current);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (offset < -activationThreshold) {
            setOffset(-maxOffset);
            setIsOpen(true);
        } else {
            setOffset(0);
            setIsOpen(false);
        }
        startX.current = null;
        currentX.current = null;
    };

    // Unified Logic
    const updateOffset = (diff: number) => {
        let newOffset = isOpen ? diff - maxOffset : diff;
        if (newOffset > 0) newOffset = 0;
        if (newOffset < -maxOffset - 50) newOffset = -maxOffset - 50;
        setOffset(newOffset);
    };

    // Tap to Nudge Hint
    const [isNudging, setIsNudging] = useState(false);
    const handleTap = () => {
        if (isOpen || isDragging) return;
        setIsNudging(true);
        setTimeout(() => setIsNudging(false), 300); // Quick bounce
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (rowRef.current && !rowRef.current.contains(e.target as Node) && isOpen) {
                setOffset(0);
                setIsOpen(false);
            }
        };
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    // Render Actions
    const renderActionButtons = () => {
        return (
            <>
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); setOffset(0); setIsOpen(false); }}
                        className="w-10 h-10 rounded-full bg-white text-neutral-600 shadow-sm flex items-center justify-center hover:bg-neutral-50 transition-all active:scale-95 pointer-events-auto"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
                {onReschedule && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onReschedule(); setOffset(0); setIsOpen(false); }}
                        className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center hover:bg-indigo-100 transition-all active:scale-95 pointer-events-auto"
                        title="Reschedule"
                    >
                        <Calendar size={16} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); setOffset(0); setIsOpen(false); }}
                        className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 shadow-sm border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-all active:scale-95 pointer-events-auto"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </>
        );
    };

    return (
        <div className="relative overflow-hidden rounded-[1.8rem] mb-3 select-none" ref={rowRef}>
            {/* BACKGROUND ACTIONS LAYER */}
            <div className="absolute inset-0 flex items-center justify-end px-6 gap-3 bg-neutral-100/50 rounded-[1.8rem]">
                {renderActionButtons()}
            </div>

            {/* FOREGROUND CONTENT LAYER */}
            <div
                className="relative bg-transparent touch-pan-y cursor-grab active:cursor-grabbing"
                style={{
                    transform: isDragging
                        ? `translateX(${offset}px)`
                        : isNudging
                            ? `translateX(-12px)`
                            : `translateX(${offset}px)`,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={handleTap}
                // TOUCH
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                // MOUSE
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                {/* Visual hint pill when swiping */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-neutral-300/50 rounded-full opacity-0 transition-opacity" style={{ opacity: isDragging ? 1 : 0 }} />

                {children}
            </div>
        </div>
    );
};
