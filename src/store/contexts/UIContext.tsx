import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewState } from '../../types';

interface UIContextType {
    currentView: ViewState;
    setCurrentView: (view: ViewState) => void;
    showUpsell: boolean;
    setShowUpsell: (show: boolean) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [showUpsell, setShowUpsell] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <UIContext.Provider
            value={{
                currentView,
                setCurrentView,
                showUpsell,
                setShowUpsell,
                sidebarOpen,
                setSidebarOpen
            }}
        >
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};
