import React, { useState } from 'react';
import { ViewState } from '../types';
import { useApp } from '../store/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Wallet,
  Bot,
  Menu,
  X,
  Settings,
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentView, setView } = useApp();
  const { logout: signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { view: ViewState.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { view: ViewState.TASKS, icon: <CheckSquare size={20} />, label: 'Tasks' },
    { view: ViewState.HABITS, icon: <Repeat size={20} />, label: 'Habits' },
    { view: ViewState.FINANCE, icon: <Wallet size={20} />, label: 'Finance' },
    { view: ViewState.ASSISTANT, icon: <Bot size={20} />, label: 'Assistant' },
  ];

  const handleNav = (view: ViewState) => {
    setView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 glass border-r border-white/60 h-screen sticky top-0 p-6 z-50">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
            LifeHub
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.view)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                ${currentView === item.view
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 font-semibold'
                  : 'text-slate-600 hover:bg-white/80 hover:text-primary-600'
                }`}
            >
              <div className={`${currentView === item.view ? 'text-white' : 'text-slate-400 group-hover:text-primary-500 transition-colors'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
              {currentView === item.view && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="pt-6 border-t border-slate-200/50 mt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white hover:text-primary-600 transition-colors"
            onClick={() => handleNav(ViewState.PROFILE)}
          >
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
              P
            </div>
            <span className="font-medium">Profile</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            onClick={signOut}
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-white/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-800">LifeHub</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE DRAWER MENU (Overlay) */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-16 right-4 w-64 glass-card bg-white p-2 animate-scale-in origin-top-right shadow-2xl" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${currentView === item.view
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              <button onClick={() => handleNav(ViewState.PROFILE)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                  P
                </div>
                <span>Profile</span>
              </button>
              <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-medium hover:bg-rose-50 rounded-xl">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 py-6 md:p-8 overflow-x-hidden w-full max-w-7xl mx-auto md:mx-0">
        <div className="pb-24 md:pb-0 font-sans">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/60 z-40 pb-safe px-6 flex items-center justify-between">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNav(item.view)}
            className={`flex flex-col items-center gap-1 transition-all duration-300
                ${currentView === item.view
                ? 'text-primary-600 -translate-y-2'
                : 'text-slate-400'
              }`}
          >
            <div className={`p-2 rounded-full transition-all ${currentView === item.view ? 'bg-primary-100 shadow-lg shadow-primary-500/20' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-medium ${currentView === item.view ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-300 absolute -bottom-5 w-max`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

    </div>
  );
};
