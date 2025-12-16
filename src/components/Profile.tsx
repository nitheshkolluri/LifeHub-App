import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import {
   X, LogOut, Download, CreditCard, Bell, ChevronRight, Moon, Clock, Zap,
   Shield, Smartphone, MessageSquare, Sun, Sunset, Crosshair, Crown, Star,
   TrendingUp, Award, Settings
} from 'lucide-react';
import { NotificationPreferences } from '../types';

interface ProfileModalProps {
   isOpen: boolean;
   onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
   const { user, logout } = useAuth();
   const { tasks, habits, finance, updateNotificationSettings, setShowUpsell } = useApp();
   const [showNotifSettings, setShowNotifSettings] = useState(false);
   const [loading, setLoading] = useState(false);

   // Local state for settings form
   const [prefs, setPrefs] = useState<NotificationPreferences>({
      quietTimeStart: user?.notificationPreferences?.quietTimeStart || '22:00',
      quietTimeEnd: user?.notificationPreferences?.quietTimeEnd || '07:00',
      afterWorkTime: user?.notificationPreferences?.afterWorkTime || '17:30',
      morningBriefTime: user?.notificationPreferences?.morningBriefTime || '08:00',
      phoneNumber: user?.notificationPreferences?.phoneNumber || '',
      enableSMS: user?.notificationPreferences?.enableSMS || false,
      enablePush: user?.notificationPreferences?.enablePush || false,
      enableTimeSensitive: user?.notificationPreferences?.enableTimeSensitive || false,
   });

   const handleSavePrefs = async () => {
      setLoading(true);
      await updateNotificationSettings(prefs);
      setLoading(false);
      setShowNotifSettings(false);
   };

   if (!isOpen) return null;

   const handleExportData = () => {
      // Helper to escape CSV fields
      const escapeCsv = (field: any) => {
         if (field === null || field === undefined) return '';
         const stringField = String(field);
         if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
         }
         return stringField;
      };

      let csvContent = `LifeHub Data Export\nGenerated Date,${new Date().toLocaleDateString()}\n\n`;

      csvContent += `TASKS\nTitle,Status,Priority,Due Date\n`;
      tasks.forEach(t => csvContent += `${escapeCsv(t.title)},${t.status},${t.priority},${escapeCsv(t.dueDate)}\n`);
      csvContent += `\nHABITS\nTitle,Streak\n`;
      habits.forEach(h => csvContent += `${escapeCsv(h.title)},${h.streak}\n`);
      csvContent += `\nFINANCE\nTitle,Amount,Paid\n`;
      finance.forEach(f => csvContent += `${escapeCsv(f.title)},${f.amount},${f.isPaidThisMonth}\n`);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lifehub_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   // Stats Calculation
   const completionRate = tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
      : 0;
   const totalRituals = habits.reduce((acc, h) => acc + h.streak, 0);

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300 font-sans">
         <div className="absolute inset-0" onClick={onClose} />

         {/* Main Container */}
         <div className="relative w-full max-w-sm bg-slate-50 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-white/50">

            {/* IDENTITY HEADER */}
            <div className="relative bg-white pt-8 pb-6 px-6 rounded-b-[40px] shadow-sm z-10">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg ${user?.isPremium ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                        {user?.name?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                           {user?.isPremium && <Crown size={12} className="text-amber-500 fill-current" />}
                           <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{user?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                     <X size={18} />
                  </button>
               </div>

               {/* Life Stats */}
               <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                     <div className="flex items-center gap-1 text-emerald-500 mb-1">
                        <TrendingUp size={14} />
                        <span className="text-base font-black">{completionRate}%</span>
                     </div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Efficiency</span>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                     <div className="flex items-center gap-1 text-indigo-500 mb-1">
                        <Award size={14} />
                        <span className="text-base font-black">{totalRituals}</span>
                     </div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Ritual XP</span>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                     <div className="flex items-center gap-1 text-rose-500 mb-1">
                        <Clock size={14} />
                        <span className="text-base font-black">1d</span>
                     </div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Streak</span>
                  </div>
               </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">

               {!showNotifSettings ? (
                  <>
                     {/* SUBSCRIPTION CARD (Enhanced) */}
                     <div className={`relative p-5 rounded-[24px] overflow-hidden group cursor-pointer border ${user?.isPremium ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-r from-violet-600 to-indigo-600 border-indigo-500'}`} onClick={() => setShowUpsell(true)}>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="relative z-10 flex justify-between items-center text-white">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <Crown size={16} className={user?.isPremium ? "text-amber-400 fill-current" : "text-white fill-current"} />
                                 <span className="font-bold text-sm tracking-wide uppercase">{user?.isPremium ? 'LifeHub Premium' : 'Upgrade to Pro'}</span>
                              </div>
                              <p className="text-xs text-white/70 font-medium max-w-[180px]">
                                 {user?.isPremium ? 'You have access to all AI features.' : 'Unlock AI Architect, Unlimited Habits & Cloud Sync.'}
                              </p>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                              <ChevronRight size={16} />
                           </div>
                        </div>
                     </div>

                     {/* SYSTEM SETTINGS */}
                     <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Control Hub</h3>

                        {/* Notifications */}
                        <button onClick={() => setShowNotifSettings(true)} className="w-full bg-white p-4 rounded-[20px] shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                              <Bell size={20} />
                           </div>
                           <div className="flex-1 text-left">
                              <p className="font-bold text-slate-800 text-sm">Notifications</p>
                              <p className="text-[10px] text-slate-400 font-bold">Alerts & Rhythms</p>
                           </div>
                           <ChevronRight size={16} className="text-slate-300" />
                        </button>

                        {/* Data Export */}
                        <button onClick={handleExportData} className="w-full bg-white p-4 rounded-[20px] shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform">
                           <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                              <Download size={20} />
                           </div>
                           <div className="flex-1 text-left">
                              <p className="font-bold text-slate-800 text-sm">Data Export</p>
                              <p className="text-[10px] text-slate-400 font-bold">Download CSV</p>
                           </div>
                           <ChevronRight size={16} className="text-slate-300" />
                        </button>
                     </div>

                     <div className="pt-2">
                        <button onClick={logout} className="w-full py-4 rounded-[20px] border border-rose-100 text-rose-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors">
                           <LogOut size={16} />
                           <span>Sign Out</span>
                        </button>
                        <p className="text-center text-[10px] text-slate-300 font-mono mt-4">ID: {user?.id.substring(0, 8)} • v1.2.0</p>
                     </div>
                  </>
               ) : (
                  <div className="animate-slide-in-right">
                     <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => setShowNotifSettings(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                           <ChevronRight size={16} className="rotate-180" />
                        </button>
                        <h3 className="font-black text-slate-800 text-lg">Notification Center</h3>
                     </div>

                     <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-6">

                        {/* Master Toggle */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><Bell size={18} /></div>
                              <div>
                                 <p className="font-bold text-slate-800 text-sm">Push Notifications</p>
                                 <p className="text-[10px] text-slate-400">Master switch for all alerts</p>
                              </div>
                           </div>
                           <input type="checkbox" checked={prefs.enablePush} onChange={e => setPrefs({ ...prefs, enablePush: e.target.checked })} className="w-5 h-5 accent-indigo-500" />
                        </div>

                        <div className="h-px bg-slate-50" />

                        {/* Precision */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-rose-50 text-rose-500 rounded-lg"><Crosshair size={18} /></div>
                              <div>
                                 <p className="font-bold text-slate-800 text-sm">Precision Alerts</p>
                                 <p className="text-[10px] text-slate-400">Exact time interrupt</p>
                              </div>
                           </div>
                           <input type="checkbox" checked={prefs.enableTimeSensitive} onChange={e => setPrefs({ ...prefs, enableTimeSensitive: e.target.checked })} className="w-5 h-5 accent-indigo-500" />
                        </div>

                        <div className="h-px bg-slate-50" />

                        {/* Times */}
                        <div className="space-y-4">
                           <label className="block">
                              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Morning Brief</span>
                              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                                 <Sun size={16} className="text-amber-500" />
                                 <input type="time" value={prefs.morningBriefTime} onChange={e => setPrefs({ ...prefs, morningBriefTime: e.target.value })} className="bg-transparent font-bold text-sm text-slate-700 outline-none text-right" />
                              </div>
                           </label>
                           <label className="block">
                              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Evening Wrap</span>
                              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                                 <Sunset size={16} className="text-indigo-500" />
                                 <input type="time" value={prefs.afterWorkTime} onChange={e => setPrefs({ ...prefs, afterWorkTime: e.target.value })} className="bg-transparent font-bold text-sm text-slate-700 outline-none text-right" />
                              </div>
                           </label>
                        </div>
                     </div>

                     <button onClick={handleSavePrefs} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors mt-6">
                        {loading ? 'Saving Changes...' : 'Save Configuration'}
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
