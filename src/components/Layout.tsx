
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { ViewState } from '../types';
import { ProfileModal } from './Profile';
import { NeuralCapture } from './NeuralCapture';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Activity, 
  DollarSign, 
  BarChart2, 
  BrainCircuit, 
  Sparkles, 
  Crown,
  User as UserIcon,
  MessageSquareText
} from 'lucide-react';

const NavItem = ({ label, icon: Icon, active, onClick, isMobile }: any) => {
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center space-y-1 w-full p-2 transition-all duration-300 ${
          active ? 'text-indigo-600 -translate-y-1' : 'text-slate-400'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${active ? 'bg-indigo-50' : ''}`}>
           <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-semibold transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`group flex items-center space-x-3 w-full p-3.5 rounded-2xl transition-all duration-300 ease-out ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1' 
          : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
      }`}
    >
      <Icon size={20} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
      <span className="font-semibold text-sm tracking-wide">{label}</span>
    </button>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentView, setView, setShowUpsell } = useApp();
  const { user } = useAuth();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Agenda', icon: LayoutDashboard },
    { id: ViewState.TASKS, label: 'Tasks', icon: CheckSquare },
    { id: ViewState.HABITS, label: 'Habits', icon: Activity },
    { id: ViewState.FINANCE, label: 'Wallet', icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-[#F3F6FC] overflow-hidden font-sans selection:bg-indigo-200 selection:text-indigo-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full p-6 z-20">
        <div className="bg-white/70 backdrop-blur-xl border border-white flex flex-col h-full rounded-[32px] p-6 shadow-2xl shadow-indigo-100/50">
            <div className="flex items-center space-x-3 px-2 mb-8 mt-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <BrainCircuit className="text-white" size={22} />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-800 tracking-tight block leading-tight">LifeHub</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Executive</span>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
                <NavItem
                key={item.id}
                {...item}
                active={currentView === item.id}
                onClick={() => setView(item.id)}
                />
            ))}
            <div className="pt-4 mt-4 border-t border-slate-100">
                 <NavItem
                    id={ViewState.REPORTS}
                    label="Insights"
                    icon={BarChart2}
                    active={currentView === ViewState.REPORTS}
                    onClick={() => setView(ViewState.REPORTS)}
                    />
                 <NavItem
                    id={ViewState.ASSISTANT}
                    label="Assistant"
                    icon={MessageSquareText}
                    active={currentView === ViewState.ASSISTANT}
                    onClick={() => setView(ViewState.ASSISTANT)}
                    />
            </div>
            </nav>

            <div className="space-y-4 mt-auto pt-4 border-t border-slate-100">
              
              {!user?.isPremium && (
                 <button onClick={() => setShowUpsell(true)} className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-lg">
                    <span className="text-xs font-bold">Upgrade to Pro</span>
                    <Crown size={14} className="text-amber-300" />
                 </button>
              )}

             <button 
                onClick={() => setIsCaptureOpen(true)}
                className="w-full group relative flex items-center justify-center space-x-2 p-3.5 rounded-2xl bg-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
                <div className="relative flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span className="font-bold text-sm">Neural Capture</span>
                </div>
            </button>
            
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                  {user?.name?.charAt(0)}
               </div>
               <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[10px] text-slate-400">Settings</p>
               </div>
            </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative">
        <div className="h-full overflow-y-auto no-scrollbar pb-28 md:pb-0 md:p-8 p-5">
           <div className="max-w-6xl mx-auto h-full">
             {children}
           </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 h-[72px] bg-white/90 backdrop-blur-xl border border-white rounded-2xl flex items-center justify-between px-2 z-30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex space-x-1 w-[40%] justify-evenly">
            <NavItem isMobile {...navItems[0]} active={currentView === navItems[0].id} onClick={() => setView(navItems[0].id)} />
            <NavItem isMobile {...navItems[1]} active={currentView === navItems[1].id} onClick={() => setView(navItems[1].id)} />
          </div>

          <div className="relative -top-6">
            <button
              onClick={() => setIsCaptureOpen(true)}
              className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border-[3px] border-[#F3F6FC] rotate-45 group"
            >
              <BrainCircuit size={24} className="-rotate-45" />
            </button>
          </div>

          <div className="flex space-x-1 w-[40%] justify-evenly">
             <NavItem isMobile {...navItems[2]} active={currentView === navItems[2].id} onClick={() => setView(navItems[2].id)} />
             <NavItem isMobile {...navItems[3]} active={currentView === navItems[3].id} onClick={() => setView(navItems[3].id)} />
          </div>
      </div>
      
      {/* Mobile Assistant Button & Profile */}
      <div className="md:hidden fixed top-5 right-5 z-20 flex space-x-3">
         <button 
           onClick={() => setIsProfileOpen(true)}
           className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg text-slate-600 border border-white"
         >
           <UserIcon size={20} />
         </button>
      </div>

      <NeuralCapture isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
