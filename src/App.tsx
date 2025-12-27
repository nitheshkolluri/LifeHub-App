
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { Layout } from './components/Layout';
import { AuthScreen as Auth, VerificationScreen } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { SubscriptionModal } from './components/Subscription';
import { StripeSuccess } from './components/StripeSuccess';
import { ViewState } from './types';
import { Loader2 } from 'lucide-react';

// --- LAZY LOADED COMPONENTS ---
// This reduces the initial bundle size significantly
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const VoiceDashboard = lazy(() => import('./components/VoiceDashboard'));
// const Home = lazy(() => import('./components/Home').then(module => ({ default: module.Home })));
const Home = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard }))); // Quick Fix: Map Home to Dashboard
const Tasks = lazy(() => import('./components/Tasks').then(module => ({ default: module.Tasks })));
const Habits = lazy(() => import('./components/Habits').then(module => ({ default: module.Habits })));
const Finance = lazy(() => import('./components/Finance').then(module => ({ default: module.Finance })));
const Assistant = lazy(() => import('./components/Assistant').then(module => ({ default: module.Assistant })));
const Reports = lazy(() => import('./components/Reports').then(module => ({ default: module.Reports })));
const Profile = lazy(() => import('./components/Profile').then(module => ({ default: module.ProfileModal })));
const PrivacyPolicy = lazy(() => import('./pages/Legal').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/Legal').then(module => ({ default: module.TermsOfService })));

const LoadingView = () => (
  <div className="h-full flex items-center justify-center">
    <Loader2 className="animate-spin text-indigo-500" size={32} />
  </div>
);

import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

// ... (previous imports)

const AppContent = () => {
  const { currentView, showUpsell, setShowUpsell, setView, showConfetti } = useApp();
  const { user, loading } = useAuth();
  const { width, height } = useWindowSize();
  const { showPaywall, setShowPaywall } = React.useContext(UsageContext) || { showPaywall: false, setShowPaywall: () => { } };

  // Onboarding Logic
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (user && !user.isPremium) {
      // If potential new user (< 1 minute old)
      if (user.createdAt) {
        const age = Date.now() - (user.createdAt as any as number); // Safe cast after fix
        if (age < 60000) {
          setShowOnboarding(true);
        }
      }
    }
  }, [user]);

  // PREVENT LOGIN FLASH: Check local storage for token
  const hasLocalToken = !!localStorage.getItem('authToken');

  // If we are loading OR (we think we have a user but firebase is still checking), show spinner
  if (loading || (hasLocalToken && !user)) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-primary-600 font-medium animate-pulse">Loading LifeHub...</p>
        </div>
      </div>
    );
  }

  // PUBLIC ROUTES (No Auth Required)
  if (window.location.pathname === '/privacy') {
    return <Suspense fallback={<LoadingView />}><PrivacyPolicy /></Suspense>;
  }
  if (window.location.pathname === '/terms') {
    return <Suspense fallback={<LoadingView />}><TermsOfService /></Suspense>;
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Home />; // The Atelier Dashboard
      case ViewState.TASKS: return <Tasks />;
      case ViewState.HABITS: return <Habits />;
      case ViewState.FINANCE: return <Finance />;
      case ViewState.ASSISTANT: return <Assistant />;
      case ViewState.PROFILE: return <Profile isOpen={true} onClose={() => setView(ViewState.DASHBOARD)} />;
      default: return <Assistant />;
    }
  };

  if (window.location.pathname === '/payment/success') {
    return <StripeSuccess />;
  }

  // Unified Modal Logic
  const isUpsellOpen = showUpsell || showPaywall;

  return (
    <Layout>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} />}
      <Suspense fallback={<LoadingView />}>
        {renderView()}

        {/* Onboarding Modal */}
        <SubscriptionModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          isOnboarding={true}
        />

        {/* Triggered Upsell Modal */}
        {isUpsellOpen && !showOnboarding && <SubscriptionModal isOpen={true} onClose={() => { setShowUpsell(false); setShowPaywall(false); }} />}
      </Suspense>

      {/* TOAST NOTIFICATION (Global) */}
      <Toast />
    </Layout>
  );
};

// Simple Toast Component
const Toast = () => {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-neutral-900/95 backdrop-blur-2xl text-white pl-4 pr-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 ring-1 ring-white/5">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <p className="text-sm font-bold tracking-wide">{toastMessage}</p>
      </div>
    </div>
  );
};

import { UsageProvider, UsageContext } from './store/UsageContext'; // Import UsageContext for the hook to work
// import { PaymentPrompt } from './components/PaymentPrompt'; // Removed

function App() {
  return (
    <AuthProvider>
      <UsageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </UsageProvider>
    </AuthProvider>
  );
}

export default App;
