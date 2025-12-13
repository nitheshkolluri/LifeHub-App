import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FinanceItem } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface FinanceContextType {
    financeItems: FinanceItem[];
    loading: boolean;
    addFinanceItem: (item: Omit<FinanceItem, 'id'>) => Promise<void>;
    updateFinanceItem: (id: string, updates: Partial<FinanceItem>) => Promise<void>;
    deleteFinanceItem: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setFinanceItems([]);
            setLoading(false);
            return;
        }

        const financeRef = collection(db, 'users', user.id, 'finance');
        const q = query(financeRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const financeData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FinanceItem[];

            setFinanceItems(financeData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching finance items:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addFinanceItem = async (itemData: Omit<FinanceItem, 'id'>) => {
        if (!user) throw new Error('User not authenticated');

        const financeRef = collection(db, 'users', user.id, 'finance');
        await addDoc(financeRef, itemData);
    };

    const updateFinanceItem = async (id: string, updates: Partial<FinanceItem>) => {
        if (!user) throw new Error('User not authenticated');

        const itemRef = doc(db, 'users', user.id, 'finance', id);
        await updateDoc(itemRef, updates);
    };

    const deleteFinanceItem = async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        const itemRef = doc(db, 'users', user.id, 'finance', id);
        await deleteDoc(itemRef);
    };

    return (
        <FinanceContext.Provider value={{ financeItems, loading, addFinanceItem, updateFinanceItem, deleteFinanceItem }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance must be used within FinanceProvider');
    return context;
};
