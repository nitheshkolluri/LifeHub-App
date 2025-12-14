
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface UsageContextType {
    usageCount: number;
    incrementUsage: () => void;
    isPremium: boolean;
    showPaywall: boolean;
    setShowPaywall: (show: boolean) => void;
    resetUsage: () => void; // For dev/testing
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

const FREE_TIER_LIMIT = 3;

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [usageCount, setUsageCount] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    // Load usage from local storage on mount (persisted for guests)
    useEffect(() => {
        const savedUsage = localStorage.getItem('lifehub_usage_count');
        if (savedUsage) {
            setUsageCount(parseInt(savedUsage, 10));
        }

        // Check premium status (mock or from user claims)
        // In a real app, check user.claims.stripeRole or firestore subscription
        if (user?.uid) {
            // Mock: Check if user has 'premium' tag or local override
            const premiumStatus = localStorage.getItem('lifehub_is_premium');
            if (premiumStatus === 'true') setIsPremium(true);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('lifehub_usage_count', usageCount.toString());
        if (usageCount >= FREE_TIER_LIMIT && !isPremium) {
            // Don't show immediately on load, only on action? 
            // Actually, we enforce it on increment.
        }
    }, [usageCount, isPremium]);

    const incrementUsage = () => {
        if (isPremium) return;

        if (usageCount >= FREE_TIER_LIMIT) {
            setShowPaywall(true);
            return;
        }

        setUsageCount(prev => prev + 1);
    };

    const resetUsage = () => {
        setUsageCount(0);
        setShowPaywall(false);
        localStorage.setItem('lifehub_usage_count', '0');
    };

    return (
        <UsageContext.Provider value={{
            usageCount,
            incrementUsage,
            isPremium,
            showPaywall,
            setShowPaywall,
            resetUsage
        }}>
            {children}
        </UsageContext.Provider>
    );
};

export const useUsage = () => {
    const context = useContext(UsageContext);
    if (context === undefined) {
        throw new Error('useUsage must be used within a UsageProvider');
    }
    return context;
};
