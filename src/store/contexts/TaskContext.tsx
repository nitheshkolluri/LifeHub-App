import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        // Real-time listener with query optimization
        const tasksRef = collection(db, 'users', user.id, 'tasks');
        const q = query(tasksRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Task[];

            setTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        if (!user) throw new Error('User not authenticated');

        const tasksRef = collection(db, 'users', user.id, 'tasks');
        await addDoc(tasksRef, {
            ...taskData,
            createdAt: Date.now(),
        });
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        if (!user) throw new Error('User not authenticated');

        const taskRef = doc(db, 'users', user.id, 'tasks', id);
        await updateDoc(taskRef, updates);
    };

    const deleteTask = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        const taskRef = doc(db, 'users', user.id, 'tasks', id);
        await deleteDoc(taskRef);
    };

    return (
        <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within TaskProvider');
    return context;
};
