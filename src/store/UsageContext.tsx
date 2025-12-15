
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

export const UsageContext = createContext<UsageContextType | undefined>(undefined);

const FREE_TIER_LIMIT = 3;


export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [usageCount, setUsageCount] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    // 1. Load usage from local storage on mount
    useEffect(() => {
        const savedUsage = localStorage.getItem('lifehub_usage_count');
        if (savedUsage) {
            setUsageCount(parseInt(savedUsage, 10));
        }
    }, []);

    // 2. Check premium or Trial status
    useEffect(() => {
        if (user?.uid) {
            // Check for Hard-coded or Local Premium override
            const localPremium = localStorage.getItem('lifehub_is_premium') === 'true';

            // Check for Account Premium status
            const accountPremium = user.isPremium;

            // Check for 7-Day Trial
            let isTrial = false;
            if (user.createdAt) {
                const msInDay = 24 * 60 * 60 * 1000;
                const diffDays = (Date.now() - user.createdAt) / msInDay;
                isTrial = diffDays <= 7;
            }

            // Unlock if ANY condition is true
            // MONETIZATION UPDATE: Force Premium for everyone (Free App)
            setIsPremium(true);
        }
    }, [user]);

    // 3. Persist Usage & Enforce Limits
    useEffect(() => {
        localStorage.setItem('lifehub_usage_count', usageCount.toString());
    }, [usageCount, isPremium]);

    const incrementUsage = () => {
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
