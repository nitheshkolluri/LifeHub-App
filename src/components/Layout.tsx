
import React, { useState } from 'react';
import { ViewState } from '../types';
import { useApp } from '../store/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Wallet,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { Logo } from './Logo';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentView, setView } = useApp();
  const { logout: signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { view: ViewState.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Home' },
    { view: ViewState.TASKS, icon: <CheckSquare size={20} />, label: 'Tasks' },
    { view: ViewState.HABITS, icon: <Repeat size={20} />, label: 'Habits' },
    { view: ViewState.FINANCE, icon: <Wallet size={20} />, label: 'Finance' },
  ];

  const handleNav = (view: ViewState) => {
    setView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative bg-white text-slate-800 font-sans">

      {/* DESKTOP SIDEBAR - ELITE WHITE */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-slate-100 h-screen sticky top-0 p-6 z-50">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 px-2 pt-2">
          <Logo size={32} />
          <span className="text-xl font-black text-slate-900 tracking-tight">LifeHub</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            let activeClass = 'bg-indigo-50 text-indigo-600';
            let barClass = 'bg-indigo-600';

            if (item.view === ViewState.HABITS) {
              activeClass = 'bg-emerald-50 text-emerald-600';
              barClass = 'bg-emerald-500';
            } else if (item.view === ViewState.FINANCE) {
              activeClass = 'bg-violet-50 text-violet-600';
              barClass = 'bg-violet-500';
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.view)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${isActive
                    ? `${activeClass} font-bold shadow-sm`
                    : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${barClass} rounded-r-full`} />}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className="text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="pt-6 border-t border-slate-100 mt-4 space-y-2">
          <button
            onClick={() => handleNav(ViewState.PROFILE)}
            className="w-full px-4 py-2 flex items-center gap-3 mb-2 hover:bg-slate-50 rounded-xl transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:border-indigo-200 transition-colors">
              <User size={16} className="text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">My Account</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Plan</span>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            onClick={signOut}
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center transition-transform active:scale-95">
            <Logo size={20} />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">LifeHub</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* MOBILE DRAWER (Full Screen Overlay) */}
      {
        isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
            <div className="absolute top-0 right-0 w-[80%] max-w-sm h-full bg-white shadow-2xl p-8 animate-slide-left flex flex-col" onClick={e => e.stopPropagation()}>

              <div className="flex justify-between items-center mb-10">
                <span className="font-black text-2xl text-slate-900">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="text-slate-500" /></button>
              </div>

              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.view)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg
                        ${currentView === item.view
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Mobile Profile Link */}
                <button
                  onClick={() => handleNav(ViewState.PROFILE)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg
                        ${currentView === ViewState.PROFILE
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  <User size={20} />
                  <span>My Account</span>
                </button>
              </div>

              <div className="mt-auto">
                <button onClick={signOut} className="w-full py-4 border-2 border-slate-100 rounded-2xl text-slate-400 font-bold hover:text-rose-500 hover:border-rose-100 transition-colors flex items-center justify-center gap-2">
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 py-8 md:p-12 overflow-x-hidden w-full max-w-6xl mx-auto">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/50 z-40 flex items-center justify-around px-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNav(item.view)}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                ${currentView === item.view
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-4 scale-110'
                : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {item.icon}
          </button>
        ))}
      </nav>

    </div >
  );
};
