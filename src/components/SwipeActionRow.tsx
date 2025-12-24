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

    const maxOffset = actions.length * 60 + 20; // 60px per action + padding

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
        // Only allow swiping left (negative offset)
        // If already open, allow swiping right to close area
        let newOffset = isOpen ? diff - maxOffset : diff;

        // Clamp logic
        if (newOffset > 0) newOffset = 0; // Can't swipe right past start
        if (newOffset < -maxOffset - 50) newOffset = -maxOffset - 50; // Elastic limit

        setOffset(newOffset);
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
                        className="w-10 h-10 rounded-full bg-white text-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors pointer-events-auto"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
                {onReschedule && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onReschedule(); setOffset(0); setIsOpen(false); }}
                        className="w-10 h-10 rounded-full bg-white text-indigo-600 shadow-sm flex items-center justify-center hover:bg-indigo-50 transition-colors pointer-events-auto"
                        title="Reschedule"
                    >
                        <Calendar size={16} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); setOffset(0); setIsOpen(false); }}
                        className="w-10 h-10 rounded-full bg-rose-500 text-white shadow-sm flex items-center justify-center hover:bg-rose-600 transition-colors pointer-events-auto"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </>
        );
    };

    return (
        <div className="relative overflow-hidden rounded-2xl mb-3 select-none" ref={rowRef}>
            {/* BACKGROUND ACTIONS LAYER */}
            <div className="absolute inset-0 flex items-center justify-end px-4 gap-2 bg-slate-100 rounded-2xl">
                {renderActionButtons()}
            </div>

            {/* FOREGROUND CONTENT LAYER */}
            <div
                className="relative bg-white rounded-2xl touch-pan-y cursor-grab active:cursor-grabbing"
                style={{
                    transform: `translateX(${offset}px)`,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
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
                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-1 bg-slate-200 rounded-full opacity-0 transition-opacity" style={{ opacity: isDragging ? 0.5 : 0 }} />

                {children}
            </div>
        </div>
    );
};
