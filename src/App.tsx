
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { Layout } from './components/Layout';
import { AuthScreen, VerificationScreen } from './components/Auth';
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
  const { currentView, showUpsell } = useApp();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Simple check to show onboarding once. In prod, store this in Firestore 'users' doc.
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (isAuthenticated && !hasSeen) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6FC]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (isAuthenticated && !user?.emailVerified) {
    return <VerificationScreen />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const renderView = () => {
    return (
      <Suspense fallback={<LoadingView />}>
        {currentView === ViewState.DASHBOARD && <Dashboard />}
        {currentView === ViewState.TASKS && <Tasks />}
        {currentView === ViewState.HABITS && <Habits />}
        {currentView === ViewState.FINANCE && <Finance />}
        {currentView === ViewState.ASSISTANT && <Assistant />}
        {currentView === ViewState.REPORTS && <Reports />}
      </Suspense>
    );
  };

  return (
    <>
      <Layout>
        {renderView()}
      </Layout>
      {showUpsell && <SubscriptionModal />}
    </>
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
