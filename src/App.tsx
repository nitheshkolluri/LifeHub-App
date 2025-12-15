
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { Layout } from './components/Layout';
import { AuthScreen as Auth, VerificationScreen } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { SubscriptionModal } from './components/Subscription';
import { ViewState } from './types';
import { Loader2 } from 'lucide-react';

// --- LAZY LOADED COMPONENTS ---
// This reduces the initial bundle size significantly
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Tasks = lazy(() => import('./components/Tasks').then(module => ({ default: module.Tasks })));
const Habits = lazy(() => import('./components/Habits').then(module => ({ default: module.Habits })));
const Finance = lazy(() => import('./components/Finance').then(module => ({ default: module.Finance })));
const Assistant = lazy(() => import('./components/Assistant').then(module => ({ default: module.Assistant })));
const Reports = lazy(() => import('./components/Reports').then(module => ({ default: module.Reports })));

const LoadingView = () => (
  <div className="h-full flex items-center justify-center">
    <Loader2 className="animate-spin text-indigo-500" size={32} />
  </div>
);

const AppContent = () => {
  const { currentView, showUpsell, setShowUpsell } = useApp();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-primary-600 font-medium animate-pulse">Loading LifeHub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.TASKS: return <Tasks />;
      case ViewState.HABITS: return <Habits />;
      case ViewState.FINANCE: return <Finance />;
      case ViewState.ASSISTANT: return <Assistant />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderView()}
      {showUpsell && <PaymentPrompt onClose={() => setShowUpsell(false)} />}
    </Layout>
  );
};

import { UsageProvider } from './store/UsageContext';
import { PaymentPrompt } from './components/PaymentPrompt';

function App() {
  return (
    <AuthProvider>
      <UsageProvider>
        <AppProvider>
          <AppContent />
          <PaymentPrompt />
        </AppProvider>
      </UsageProvider>
    </AuthProvider>
  );
}

export default App;
