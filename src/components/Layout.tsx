import React, { useState } from 'react';
import { ViewState } from '../types';
import { useApp } from '../store/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Wallet,
  Mic,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { VoiceOverlay } from './VoiceOverlay';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentView, setView } = useApp();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // New Minimal Mobile-First Navigation
  const navItems = [
    { view: ViewState.DASHBOARD, icon: <LayoutDashboard size={24} strokeWidth={2.5} />, label: 'Day' },
    { view: ViewState.TASKS, icon: <CheckSquare size={24} strokeWidth={2.5} />, label: 'Tasks' },
    // Middle is Mic
    { view: ViewState.HABITS, icon: <Repeat size={24} strokeWidth={2.5} />, label: 'Habits' },
    { view: ViewState.PROFILE, icon: <User size={24} strokeWidth={2.5} />, label: 'Me' },
  ];

  return (

    <div className="min-h-screen bg-[var(--color-bg)] text-zinc-900 font-sans flex flex-col overflow-hidden max-w-md mx-auto md:max-w-full md:border-x md:border-zinc-200 shadow-2xl">

      {/* 1. VOICE OVERLAY (Global) */}
      <VoiceOverlay isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* 2. MAIN CONTENT SCROLLABLE AREA */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32 pt-6 px-6 relative z-10 w-full md:max-w-2xl md:mx-auto">
        {children}
      </main>

      {/* 3. BOTTOM NAVIGATION (Structured Style) */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent z-40 flex items-end justify-center pb-6 md:max-w-2xl md:mx-auto pointer-events-none">
        {/* Functional Bar Container */}
        <div className="bg-white border border-zinc-200 rounded-full px-6 py-3 flex items-center gap-8 shadow-xl shadow-zinc-200/50 pointer-events-auto">
          {/* Left Items */}
          <button
            onClick={() => setView(ViewState.DASHBOARD)}
            className={`bottom-nav-item ${currentView === ViewState.DASHBOARD ? 'active' : ''}`}
          >
            <LayoutDashboard size={24} className={currentView === ViewState.DASHBOARD ? 'text-rose-500' : 'text-zinc-400'} />
          </button>

          <button
            onClick={() => setView(ViewState.TASKS)}
            className={`bottom-nav-item ${currentView === ViewState.TASKS ? 'active' : ''}`}
          >
            <CheckSquare size={24} className={currentView === ViewState.TASKS ? 'text-blue-500' : 'text-zinc-400'} />
          </button>

          {/* HERO MIC BUTTON */}
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="hero-mic-button -mt-8 bg-zinc-900 text-white hover:bg-black"
          >
            <Mic size={28} className="text-white" strokeWidth={3} />
          </button>

          {/* Right Items */}
          <button
            onClick={() => setView(ViewState.HABITS)}
            className={`bottom-nav-item ${currentView === ViewState.HABITS ? 'active' : ''}`}
          >
            <Repeat size={24} className={currentView === ViewState.HABITS ? 'text-emerald-500' : 'text-zinc-400'} />
          </button>

          <button
            onClick={() => setView(ViewState.PROFILE)}
            className={`bottom-nav-item ${currentView === ViewState.PROFILE ? 'active' : ''}`}
          >
            <User size={24} className={currentView === ViewState.PROFILE ? 'text-purple-500' : 'text-zinc-400'} />
          </button>
        </div>
      </nav>

    </div>
  );
};
