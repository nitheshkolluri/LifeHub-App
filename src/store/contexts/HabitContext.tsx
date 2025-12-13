import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habit } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface HabitContextType {
    habits: Habit[];
    loading: boolean;
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => Promise<void>;
    completeHabit: (id: string, date?: string) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setHabits([]);
            setLoading(false);
            return;
        }

        const habitsRef = collection(db, 'users', user.id, 'habits');
        const q = query(habitsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const habitsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Habit[];

            setHabits(habitsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching habits:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addHabit = async (habitData: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => {
        if (!user) throw new Error('User not authenticated');

        const habitsRef = collection(db, 'users', user.id, 'habits');
        await addDoc(habitsRef, {
            ...habitData,
            streak: 0,
            completedDates: [],
            startDate: new Date().toISOString().split('T')[0],
        });
    };

    const completeHabit = async (id: string, date?: string) => {
        if (!user) throw new Error('User not authenticated');

        const habitRef = doc(db, 'users', user.id, 'habits', id);
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const completionDate = date || new Date().toISOString().split('T')[0];

        if (!habit.completedDates.includes(completionDate)) {
            const newCompletedDates = [...habit.completedDates, completionDate];

            // Calculate streak
            const sortedDates = newCompletedDates.sort();
            let streak = 1;
            for (let i = sortedDates.length - 1; i > 0; i--) {
                const current = new Date(sortedDates[i]);
                const previous = new Date(sortedDates[i - 1]);
                const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }

            await updateDoc(habitRef, {
                completedDates: newCompletedDates,
                streak,
            });
        }
    };

    const deleteHabit = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        const habitRef = doc(db, 'users', user.id, 'habits', id);
        await deleteDoc(habitRef);
    };

    return (
        <HabitContext.Provider value={{ habits, loading, addHabit, completeHabit, deleteHabit }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitContext);
    if (!context) throw new Error('useHabits must be used within HabitProvider');
    return context;
};
